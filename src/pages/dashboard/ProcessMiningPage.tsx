import { Card, Typography, Row, Col, Tabs } from 'antd';
import { D3ProcessMap } from '../../components/process-mining/D3ProcessMap';
import { D3SankeyDiagram } from '../../components/process-mining/D3SankeyDiagram';
import { ProcessHeatmap } from '../../components/process-mining/ProcessHeatmap';
import { ProcessMetricsCard } from '../../components/process-mining/ProcessMetricsCard';
import { ProcessActivityChart } from '../../components/process-mining/ProcessActivityChart';
import { BPMNViewer } from '../../components/process-mining/BPMNViewer';

const { Title } = Typography;

// D3 Process Map Data
const processNodes = [
  { id: '1', label: 'Start', type: 'start' as const, count: 1247, avgDuration: 0 },
  { id: '2', label: 'Create PO', type: 'activity' as const, count: 1247, avgDuration: 2.5 },
  { id: '3', label: 'Approval Gate', type: 'gateway' as const, count: 1185, avgDuration: 12.3 },
  { id: '4', label: 'Send Order', type: 'activity' as const, count: 1067, avgDuration: 1.8 },
  { id: '5', label: 'Receive Goods', type: 'activity' as const, count: 982, avgDuration: 48.2 },
  { id: '6', label: 'Record Invoice', type: 'activity' as const, count: 950, avgDuration: 5.6 },
  { id: '7', label: 'Payment', type: 'activity' as const, count: 876, avgDuration: 15.2 },
  { id: '8', label: 'Complete', type: 'end' as const, count: 876, avgDuration: 0 },
];

const processLinks = [
  { source: '1', target: '2', frequency: 1247, percentage: 100 },
  { source: '2', target: '3', frequency: 1185, percentage: 95 },
  { source: '3', target: '4', frequency: 1067, percentage: 90 },
  { source: '4', target: '5', frequency: 982, percentage: 92 },
  { source: '4', target: '6', frequency: 950, percentage: 89 },
  { source: '5', target: '7', frequency: 876, percentage: 89 },
  { source: '6', target: '7', frequency: 876, percentage: 92 },
  { source: '7', target: '8', frequency: 876, percentage: 100 },
];

// Sankey Diagram Data
const sankeyNodes = [
  { name: 'Purchase Order Created', count: 1247 },
  { name: 'Approved', count: 1185 },
  { name: 'Sent to Supplier', count: 1067 },
  { name: 'Goods Received', count: 982 },
  { name: 'Invoice Recorded', count: 950 },
  { name: 'Payment Complete', count: 876 },
];

const sankeyLinks = [
  { source: 0, target: 1, value: 1185 },
  { source: 1, target: 2, value: 1067 },
  { source: 2, target: 3, value: 982 },
  { source: 2, target: 4, value: 950 },
  { source: 3, target: 5, value: 876 },
  { source: 4, target: 5, value: 876 },
];

// Heatmap Data
const heatmapData: { activity: string; hour: number; value: number }[] = [];
const activities = ['Create PO', 'Approve PO', 'Send Order', 'Receive Goods', 'Record Invoice'];
for (let hour = 8; hour <= 18; hour++) {
  for (const activity of activities) {
    heatmapData.push({
      activity,
      hour,
      value: Math.floor(Math.random() * 100) + 20,
    });
  }
}

// Sample activity data
const activityData = [
  { name: 'Create PO', count: 1247, avgDuration: 2.5 },
  { name: 'Approve PO', count: 1185, avgDuration: 12.3 },
  { name: 'Send Order', count: 1067, avgDuration: 1.8 },
  { name: 'Receive Goods', count: 982, avgDuration: 48.2 },
  { name: 'Record Invoice', count: 950, avgDuration: 5.6 },
  { name: 'Complete', count: 876, avgDuration: 2.1 },
];

// Sample BPMN XML
const sampleBPMN = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
             targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="Process_1" isExecutable="false">
    <startEvent id="StartEvent_1" name="Start">
      <outgoing>Flow_1</outgoing>
    </startEvent>
    <task id="Activity_1" name="Create Purchase Order">
      <incoming>Flow_1</incoming>
      <outgoing>Flow_2</outgoing>
    </task>
    <task id="Activity_2" name="Approve Order">
      <incoming>Flow_2</incoming>
      <outgoing>Flow_3</outgoing>
    </task>
    <task id="Activity_3" name="Send to Supplier">
      <incoming>Flow_3</incoming>
      <outgoing>Flow_4</outgoing>
    </task>
    <endEvent id="EndEvent_1" name="End">
      <incoming>Flow_4</incoming>
    </endEvent>
    <sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Activity_2" />
    <sequenceFlow id="Flow_3" sourceRef="Activity_2" targetRef="Activity_3" />
    <sequenceFlow id="Flow_4" sourceRef="Activity_3" targetRef="EndEvent_1" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <omgdc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <omgdc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <omgdc:Bounds x="400" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <omgdc:Bounds x="560" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <omgdc:Bounds x="722" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <omgdi:waypoint x="188" y="120" />
        <omgdi:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <omgdi:waypoint x="340" y="120" />
        <omgdi:waypoint x="400" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <omgdi:waypoint x="500" y="120" />
        <omgdi:waypoint x="560" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <omgdi:waypoint x="660" y="120" />
        <omgdi:waypoint x="722" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

export const ProcessMiningPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Process Mining Dashboard</Title>
        <p className="text-gray-600">
          Analyze and visualize your business processes to identify bottlenecks and optimization opportunities
        </p>
      </div>

      <ProcessMetricsCard
        totalCases={1247}
        avgDuration="3.2 days"
        efficiency={87}
        bottlenecks={3}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="shadow-md rounded-xl">
            <Title level={4}>Process Flow Visualization</Title>
            <Tabs
              items={[
                {
                  key: 'process-map',
                  label: 'Process Discovery Map',
                  children: <D3ProcessMap nodes={processNodes} links={processLinks} />,
                },
                {
                  key: 'sankey',
                  label: 'Process Flow (Sankey)',
                  children: <D3SankeyDiagram nodes={sankeyNodes} links={sankeyLinks} />,
                },
                {
                  key: 'bpmn',
                  label: 'BPMN Diagram',
                  children: <BPMNViewer xml={sampleBPMN} />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="shadow-md rounded-xl">
            <Title level={4}>Bottleneck Analysis - Activity Heatmap</Title>
            <ProcessHeatmap data={heatmapData} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <ProcessActivityChart data={activityData} />
        </Col>
      </Row>
    </div>
  );
};
