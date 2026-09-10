-- 0232 — forward-fix: fecha grants sem consumidor e inclui os repositórios de
-- texto pessoal na cascata LGPD. As seis RPCs de sessão que permanecem com
-- authenticated têm call site e autorização interna provados pelo gate.

revoke execute on function public.fn_reply_action(uuid,uuid,text,text,text,text) from authenticated;
revoke execute on function public.fn_reserve_channel_connection(uuid,uuid,text,text,boolean) from authenticated;
revoke execute on function public.fn_set_channel_routing(uuid,uuid,uuid[],boolean) from authenticated;

create or replace function public.fn_lgpd_cascade_redact_contact(
  p_organization_id uuid,
  p_contact_id uuid,
  p_request_id uuid
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_already bool;
  v_counts jsonb := '{}'::jsonb;
  v_media_paths text[] := '{}';
  v_anon_label text;
  v_count int;
begin
  perform public.fn_service_lock(p_organization_id,p_contact_id);
  select is_anonymized into v_already
    from public.contacts
   where id=p_contact_id and organization_id=p_organization_id;

  if not found then raise exception 'contact not found' using errcode='P0002'; end if;
  if v_already then
    return jsonb_build_object('already_anonymized',true,'counts',v_counts,'media_paths',v_media_paths);
  end if;

  v_anon_label := 'Cliente Anonimizado #' || substring(p_contact_id::text from 1 for 8);
  select coalesce(array_agg(distinct media_storage_path) filter(where media_storage_path is not null),'{}')
    into v_media_paths from public.messages
   where organization_id=p_organization_id
     and conversation_id in(select id from public.conversations where contact_id=p_contact_id and organization_id=p_organization_id);

  update public.contacts set
    name=v_anon_label,display_name=v_anon_label,email=null,phone_number=null,
    cpf_encrypted=null,cpf_hash=null,birthdate=null,is_anonymized=true,
    anonymized_at=now(),consent='{}'::jsonb,source_metadata='{}'::jsonb,
    tags='{}'::text[],updated_at=now()
   where id=p_contact_id and organization_id=p_organization_id;
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('contacts',v_count);

  update public.conversations set metadata='{}'::jsonb,last_message_preview=null,updated_at=now()
   where contact_id=p_contact_id and organization_id=p_organization_id;
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('conversations',v_count);

  update public.messages set body='[mensagem anonimizada]',media_url=null,media_mime=null,
    media_size_bytes=null,media_storage_path=null,metadata='{}'::jsonb,updated_at=now()
   where organization_id=p_organization_id
     and conversation_id in(select id from public.conversations where contact_id=p_contact_id and organization_id=p_organization_id);
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('messages',v_count);

  update public.crm_lead_activities set payload='{}'::jsonb,metadata='{}'::jsonb,reason=null
   where organization_id=p_organization_id and (
     contact_id=p_contact_id
     or lead_id in(select lead_id from public.crm_lead_links where target_kind='contact' and target_id=p_contact_id and organization_id=p_organization_id)
     or lead_id in(select id from public.crm_leads where contact_id=p_contact_id and organization_id=p_organization_id));
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('activities',v_count);

  update public.crm_leads set title=v_anon_label,description=null,custom_fields='{}'::jsonb,
    source_metadata='{}'::jsonb,tags='{}'::text[],updated_at=now()
   where organization_id=p_organization_id and (
     contact_id=p_contact_id
     or id in(select lead_id from public.crm_lead_links where target_kind='contact' and target_id=p_contact_id and organization_id=p_organization_id));
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('leads',v_count);

  update public.orders set
    payload=coalesce(payload,'{}'::jsonb)-'customer'-'customer_name'-'customer_email'-'customer_phone'-'shipping_address'-'billing_address'-'contact_identification',
    customer_external_id=null,contact_id=null,is_anonymized=true,updated_at=now()
   where organization_id=p_organization_id and contact_id=p_contact_id;
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('orders',v_count);

  -- Rascunhos e feedback carregam texto derivado da conversa. O histórico de
  -- estado permanece, mas todo conteúdo reidentificável é removido.
  update public.ai_reply_drafts set
    original_body=null,edited_body=null,approved_body=null,proposals='[]'::jsonb,
    trace='[]'::jsonb,feedback=null,service_boundary='{}'::jsonb,
    error_code=null,status=case when status in('generating','pending','approved','sending') then 'stale' else status end,
    revision=revision+1,updated_at=now()
   where organization_id=p_organization_id and contact_id=p_contact_id;
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('ai_reply_drafts',v_count);

  -- O trigger da 0210 já faz esta redação; a operação explícita mantém a
  -- cascata autocontida e visível ao inventário jurídico.
  update public.crm_tasks set title='Tarefa de contato anonimizado',description=null,updated_at=now()
   where organization_id=p_organization_id and contact_id=p_contact_id;
  get diagnostics v_count=row_count;
  v_counts:=v_counts||jsonb_build_object('crm_tasks',v_count);

  if array_length(v_media_paths,1)>0 then
    insert into public.storage_redaction_queue(organization_id,request_id,bucket,object_path)
    select p_organization_id,p_request_id,'whatsapp-media',path
      from unnest(v_media_paths) path where path is not null and length(path)>0
    on conflict(bucket,object_path) do nothing;
  end if;

  insert into public.api_audit_log(organization_id,action,actor_user_id,resource_type,resource_id,metadata,bypassed_rls)
  values(p_organization_id,'lgpd.redact_executed',null,'contact',p_contact_id,
    jsonb_build_object('cascaded_to',v_counts,'media_queued',coalesce(array_length(v_media_paths,1),0),'request_id',p_request_id),true);

  return jsonb_build_object('already_anonymized',false,'counts',v_counts,'media_paths',v_media_paths);
end;
$$;

revoke execute on function public.fn_lgpd_cascade_redact_contact(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.fn_lgpd_cascade_redact_contact(uuid,uuid,uuid) to service_role;

notify pgrst,'reload schema';
