import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTaskOverdue,
  isTaskDueToday,
  calculateDashboardMetrics,
  calculateStageProgress,
  calculateClientProgress,
  generateClientTemplateTasks,
  STAGE_TEMPLATES,
  TaskItem,
  ClientItem,
} from './metrics';

test('isTaskOverdue correctly checks past dates only if not completed', () => {
  const baseTask: TaskItem = {
    id: 't1',
    clientId: 'c1',
    clientName: 'Cliente Teste',
    stageId: '1',
    title: 'Tarefa Teste',
    responsibleId: 'u1',
    responsibleName: 'Admin',
    dueDate: '2026-11-10',
    priority: 'media',
    status: 'a_fazer',
    orderIndex: 1,
    cycleNumber: 1,
    createdAt: '2026-11-01',
    updatedAt: '2026-11-01',
  };

  assert.equal(isTaskOverdue(baseTask, '2026-11-11'), true);
  assert.equal(isTaskOverdue(baseTask, '2026-11-10'), false);
  assert.equal(isTaskOverdue(baseTask, '2026-11-09'), false);

  const completedTask: TaskItem = { ...baseTask, status: 'concluida' };
  assert.equal(isTaskOverdue(completedTask, '2026-11-11'), false);
});

test('STAGE_TEMPLATES contains exactly 9 stages and 54 total tasks', () => {
  assert.equal(STAGE_TEMPLATES.length, 9);
  const totalTasks = STAGE_TEMPLATES.reduce(
    (acc, stage) => acc + stage.defaultTasks.length,
    0
  );
  assert.equal(totalTasks, 54);
});

test('generateClientTemplateTasks creates all 54 tasks or subset when specified', () => {
  const allTasks = generateClientTemplateTasks({
    clientId: 'c_test',
    clientName: 'Cliente Real',
    responsibleId: 'u_admin',
    responsibleName: 'Emanuel',
    cycleNumber: 1,
    startDateStr: '2026-11-11',
  });

  assert.equal(allTasks.length, 54);
  assert.equal(allTasks[0].title, 'Analisar os conteúdos e indicadores anteriores.');
  assert.equal(allTasks[53].title, 'Repriorizar o calendário editorial conforme os resultados.');

  // Test subset selection
  const subset = generateClientTemplateTasks({
    clientId: 'c_test',
    clientName: 'Cliente Real',
    responsibleId: 'u_admin',
    responsibleName: 'Emanuel',
    cycleNumber: 1,
    startDateStr: '2026-11-11',
    selectedTaskIds: [1, 2, 7, 14, 27],
  });
  assert.equal(subset.length, 5);
});

test('Dashboard metrics with zero data returns all 0 counts', () => {
  const metrics = calculateDashboardMetrics([], [], '2026-11-11');
  assert.equal(metrics.todayCount, 0);
  assert.equal(metrics.overdueCount, 0);
  assert.equal(metrics.inProgressCount, 0);
  assert.equal(metrics.completedCount, 0);
  assert.equal(metrics.activeClientsCount, 0);
});
