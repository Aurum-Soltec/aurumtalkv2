"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  toReactFlow,
  fromReactFlow,
  graphsEqual,
  toFlowNode,
  type RFNode,
  type RFEdge,
  type RFNodeData,
} from "@/lib/followup/graph-mappers";
import { conditionLabel } from "@/lib/followup/edge-condition-options";
import {
  branchIdForCondition,
  conditionForBranch,
  nodeBranches,
  type FlowEdge,
  type FlowGraph,
  type NodeType,
} from "@/lib/followup/graph-schema";
import { rotuloDoRamo } from "@/lib/followup/rotulo-do-ramo";
import { useFollowupFlow, type FollowupFlowDetailRow } from "@/hooks/followup/useFollowupFlow";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Plus, X } from "@/lib/ui/icons";
import { NodeConfigPanel } from "./NodeConfigPanel";
import { EdgeConfigPanel } from "./EdgeConfigPanel";
import { NodePalette } from "./NodePalette";
import { PublishBar } from "./PublishBar";
import { NODE_VISUALS } from "./nodes/nodeVisuals";
import { TriggerNode } from "./nodes/TriggerNode";
import { WaitNode } from "./nodes/WaitNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { ClassifyNode } from "./nodes/ClassifyNode";
import { MatchReplyNode } from "./nodes/MatchReplyNode";
import { RepeatNode } from "./nodes/RepeatNode";
import { ActionNode } from "./nodes/ActionNode";
import { EndNode } from "./nodes/EndNode";

const EMPTY_GRAPH: FlowGraph = { nodes: [], edges: [] };
const DND_MIME = "application/x-followup-node-type";

// Defined outside the component — React Flow warns (and re-mounts nodes) if
// nodeTypes is a fresh object every render.
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  wait: WaitNode,
  condition: ConditionNode,
  ai_classify: ClassifyNode,
  match_reply: MatchReplyNode,
  repeat: RepeatNode,
  action: ActionNode,
  end: EndNode,
};

interface Props {
  flowId: string;
  initialData: FollowupFlowDetailRow;
}

function FlowCanvasInner({ flowId, initialData }: Props) {
  const t = useT();
  const { data: flow } = useFollowupFlow(flowId, { initialData });
  // `initial` seeds React Flow state ONCE on mount — it must NOT react to
  // `flow` changing on every refetch (that would clobber in-progress edits).
  const initial = useMemo(
    () => toReactFlow(initialData.draft_graph ?? EMPTY_GRAPH),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>(initial.edges);
  const [savedGraph, setSavedGraph] = useState<FlowGraph>(initialData.draft_graph ?? EMPTY_GRAPH);
  const nextId = useRef(1);
  const nextEdgeId = useRef(1);
  const { screenToFlowPosition } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const liveGraph = useMemo(() => fromReactFlow(nodes, edges), [nodes, edges]);
  const dirty = useMemo(() => !graphsEqual(liveGraph, savedGraph), [liveGraph, savedGraph]);
  const [history, setHistory] = useState<FlowGraph[]>([]);
  const remember = useCallback(() => {
    setHistory((previous) => {
      const last = previous.at(-1);
      return last && graphsEqual(last, liveGraph)
        ? previous
        : [...previous.slice(-99), structuredClone(liveGraph)];
    });
  }, [liveGraph]);
  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    const restored = toReactFlow(previous);
    setNodes(restored.nodes);
    setEdges(restored.edges);
    setHistory(history.slice(0, -1));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const markNodeErrors = useCallback(
    (errorsByNode: Record<string, string[]>) => {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, errors: errorsByNode[n.id] } })),
      );
    },
    [setNodes],
  );
  const clearNodeErrors = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => (n.data.errors ? { ...n, data: { ...n.data, errors: undefined } } : n)),
    );
  }, [setNodes]);

  // Node and edge selection are mutually exclusive — opening one panel closes the other's.
  const onNodeClick = useCallback<NodeMouseHandler<RFNode>>((_, node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, []);
  const onEdgeClick = useCallback<EdgeMouseHandler<RFEdge>>((_, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const updateNodeData = useCallback(
    (id: string, patch: Partial<RFNodeData>) => {
      remember();
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes, remember],
  );
  const updateEdgeCondition = useCallback(
    (id: string, condition: FlowEdge["condition"]) => {
      remember();
      setEdges((eds) =>
        eds.map((e) =>
          e.id === id ? { ...e, data: { priority: e.data?.priority ?? 0, condition } } : e,
        ),
      );
    },
    [setEdges, remember],
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null;
  const selectedEdgeSource = selectedEdge
    ? (nodes.find((n) => n.id === selectedEdge.source) ?? null)
    : null;
  const selectedEdgeTarget = selectedEdge
    ? (nodes.find((n) => n.id === selectedEdge.target) ?? null)
    : null;

  // Wire label: derived at render time from `data.condition`, never persisted on the edge
  // itself — `condition` alone stays the source of truth the mapper round-trips.
  // Num nó que ramifica o texto vem do RAMO (o rótulo que o usuário leu na
  // bolinha de onde arrastou), não da condição crua: `conditionLabel` sozinho
  // mostraria o id do ramo, que não é palavra nenhuma para quem não programa.
  const edgesForRender = useMemo(
    () =>
      edges.map((e) => {
        const condition = e.data?.condition ?? { type: "always" as const };
        const source = nodes.find((n) => n.id === e.source);
        const branch = source
          ? nodeBranches(toFlowNode(source)).find(
              (b) => b.id === branchIdForCondition(toFlowNode(source), condition),
            )
          : undefined;
        return {
          ...e,
          label: branch ? t(rotuloDoRamo(branch)) : t(conditionLabel(condition)),
          selected: e.id === selectedEdgeId,
        };
      }),
    [edges, nodes, selectedEdgeId, t],
  );

  // Quais saídas do nó selecionado já têm aresta. Quem sabe isso é o canvas —
  // o formulário não vê o grafo, e sem esse dado ele trocaria o modo do nó
  // deixando ligações órfãs sem conseguir dizer quantas.
  const ramosLigadosDoSelecionado = useMemo(() => {
    if (!selectedNode) return [];
    const source = toFlowNode(selectedNode);
    return edges
      .filter((e) => e.source === selectedNode.id)
      .map((e) => branchIdForCondition(source, e.data?.condition ?? { type: "always" }))
      .filter((id): id is string => id !== null);
  }, [selectedNode, edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      remember();
      // A bolinha de onde o usuário arrastou É a saída escolhida: o React Flow
      // devolve o id do ramo em `sourceHandle`. Antes a aresta nascia sempre
      // `always` e o usuário tinha que ir ao painel dizer de novo, de qual regra
      // ela saía — o que, com uma bolinha só, era impossível de expressar.
      const source = nodes.find((n) => n.id === connection.source);
      const fromBranch =
        source && connection.sourceHandle
          ? conditionForBranch(toFlowNode(source), connection.sourceHandle)
          : null;
      let id = `edge-${nextEdgeId.current++}`;
      while (edges.some((edge) => edge.id === id)) id = `edge-${nextEdgeId.current++}`;
      const newEdge: RFEdge = {
        id,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        data: { priority: 0, condition: fromBranch ?? { type: "always" } },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, nodes, edges, remember],
  );

  const addNodeAt = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      remember();
      const visual = NODE_VISUALS[type];
      let id = `${type}-${nextId.current++}`;
      while (nodes.some((node) => node.id === id)) id = `${type}-${nextId.current++}`;
      const newNode: RFNode = {
        id,
        type,
        position,
        data: { label: t(visual.defaultLabel), config: visual.defaultConfig() },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, nodes, t, remember],
  );

  const onPaletteAdd = useCallback(
    (type: NodeType) => {
      const index = nodes.length;
      addNodeAt(type, { x: 80 + (index % 4) * 220, y: 80 + Math.floor(index / 4) * 150 });
    },
    [nodes.length, addNodeAt],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData(DND_MIME) as NodeType | "";
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNodeAt(type, position);
    },
    [screenToFlowPosition, addNodeAt],
  );

  return (
    <div className="flex h-full min-h-[600px] w-full flex-col">
      {flow && (
        <PublishBar
          flowId={flowId}
          flow={flow}
          graph={liveGraph}
          dirty={dirty}
          onSaved={setSavedGraph}
          onPublishErrors={markNodeErrors}
          onPublishSuccess={clearNodeErrors}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onAdd={onPaletteAdd} />
        {/* Abaixo de `lg` a paleta fixa de 224px não cabe do lado do canvas —
            vira um drawer, disparado por este botão flutuante. */}
        <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
          <SheetContent side="left" className="w-72 max-w-[85vw] gap-0 p-0 lg:hidden">
            <SheetTitle className="sr-only">{t("Adicionar nó")}</SheetTitle>
            <NodePalette
              variant="mobile"
              onAdd={(type) => {
                onPaletteAdd(type);
                setPaletteOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>

        <div
          className="relative h-full flex-1"
          data-testid="flow-canvas"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edgesForRender}
            nodeTypes={nodeTypes}
            onNodesChange={(changes) => {
              if (changes.some((change) => change.type === "remove")) remember();
              onNodesChange(changes);
            }}
            onEdgesChange={(changes) => {
              if (changes.some((change) => change.type === "remove")) remember();
              onEdgesChange(changes);
            }}
            onNodeDragStart={remember}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 z-10 shadow-md"
            disabled={history.length === 0}
            onClick={undo}
          >
            {t("Desfazer ação")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-4 left-4 z-10 shadow-md lg:hidden"
            onClick={() => setPaletteOpen(true)}
          >
            <Plus size={14} aria-hidden /> {t("Adicionar nó")}
          </Button>
        </div>

        {/*
          Docked panel em telas grandes (`lg:`) — NÃO é overlay ali: o canvas
          continua clicável, então trocar de nó/aresta selecionado funciona com
          o painel aberto. Abaixo de `lg` os 384px (`w-96`) sozinhos já passavam
          da largura de QUALQUER celular, e como o pai é `overflow-hidden`, o
          painel não ganhava scroll — ficava certo, cortado, inacessível. Vira
          bottom sheet (`fixed`, ancorado embaixo, com teto de altura e X pra
          fechar) só nesse intervalo de tela.
        */}
        {selectedNode && (
          <aside
            className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 flex max-h-[75vh] flex-col overflow-hidden rounded-t-lg border-t shadow-lg lg:static lg:z-auto lg:h-full lg:max-h-none lg:w-96 lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none"
            data-testid="node-config-sheet"
          >
            {/* Barra própria pro X, não sobreposta ao conteúdo — um botão
                flutuante por cima do cabeçalho do painel colidiria com rótulo
                comprido (texto sobre texto). */}
            <div className="flex shrink-0 justify-end p-2 lg:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNodeId(null)}
                aria-label={t("Fechar")}
              >
                <X size={16} aria-hidden />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pt-0 lg:pt-4">
              <NodeConfigPanel
                key={selectedNode.id}
                node={selectedNode}
                onChange={(patch) => updateNodeData(selectedNode.id, patch)}
                ramosLigados={ramosLigadosDoSelecionado}
              />
              <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !edges.some(
                      (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id,
                    )
                  }
                  onClick={() => {
                    remember();
                    setEdges((current) =>
                      current.filter(
                        (edge) =>
                          edge.source !== selectedNode.id && edge.target !== selectedNode.id,
                      ),
                    );
                  }}
                >
                  {t("Desconectar box")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    remember();
                    setEdges((current) =>
                      current.filter(
                        (edge) =>
                          edge.source !== selectedNode.id && edge.target !== selectedNode.id,
                      ),
                    );
                    setNodes((current) => current.filter((node) => node.id !== selectedNode.id));
                    setSelectedNodeId(null);
                  }}
                >
                  {t("Excluir box")}
                </Button>
                <p className="text-text-muted text-xs">
                  {t(
                    "Excluir remove o box e suas conexões. Você pode desfazer antes de sair do editor.",
                  )}
                </p>
              </div>
            </div>
          </aside>
        )}

        {selectedEdge && (
          <aside
            className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 flex max-h-[75vh] flex-col overflow-hidden rounded-t-lg border-t shadow-lg lg:static lg:z-auto lg:h-full lg:max-h-none lg:w-96 lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none"
            data-testid="edge-config-sheet"
          >
            <div className="flex shrink-0 justify-end p-2 lg:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEdgeId(null)}
                aria-label={t("Fechar")}
              >
                <X size={16} aria-hidden />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pt-0 lg:pt-4">
              <EdgeConfigPanel
                key={selectedEdge.id}
                sourceNode={selectedEdgeSource ? toFlowNode(selectedEdgeSource) : undefined}
                targetNode={selectedEdgeTarget ? toFlowNode(selectedEdgeTarget) : undefined}
                condition={selectedEdge.data?.condition ?? { type: "always" }}
                onChange={(condition) => updateEdgeCondition(selectedEdge.id, condition)}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  remember();
                  setEdges((current) => current.filter((edge) => edge.id !== selectedEdge.id));
                  setSelectedEdgeId(null);
                }}
              >
                {t("Remover conexão")}
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export function FlowCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
