import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebaseConfig';
import CenteredContainer from '../common/CenteredContainer';

const THANKSGIVING_TASKS = [
  {
    id: 'task1',
    title: 'Share a comfort food memory',
    description: 'Post one photo or story about a comfort food that makes you feel grateful (no recipe needed—just the memory).',
  },
  {
    id: 'task2',
    title: 'Cook one small thing just for yourself',
    description: 'Make a simple warm drink, toast, or snack this week—no sharing required, no photo needed unless you want to.',
  },
  {
    id: 'task3',
    title: 'Try one ingredient you\'re thankful for',
    description: 'Pick one ingredient you appreciate (seasonal produce, a pantry staple, etc.) and use it in any simple way this week—share what you made or just check it off.',
  },
  {
    id: 'task4',
    title: 'Give a cooking encouragement',
    description: 'Comment on someone else\'s post with something supportive—a compliment, a "me too," or a simple emoji.',
  },
  {
    id: 'task5',
    title: 'Check in mid-week',
    description: 'Log anything you cooked, ate, or thought about food this week—even if it\'s just "had cereal, felt cozy."',
  },
];

const ThanksgivingChallenge = ({ completedTasks = [], onTaskToggle }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (taskId) => {
    setExpanded(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleTaskToggle = async (taskId) => {
    if (onTaskToggle) {
      onTaskToggle(taskId);
    }
  };

  const completedCount = completedTasks.length;
  const totalTasks = THANKSGIVING_TASKS.length;

  return (
    <CenteredContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍂 Thanksgiving Challenge</Text>
        <Text style={styles.subtitle}>Complete simple, low-pressure tasks this week</Text>
        <Text style={styles.progress}>{completedCount}/{totalTasks} completed</Text>
      </View>

      {THANKSGIVING_TASKS.map((task) => {
        const isCompleted = completedTasks.includes(task.id);
        const isExpanded = expanded[task.id];

        return (
          <View key={task.id} style={styles.taskContainer}>
            <TouchableOpacity 
              style={styles.taskHeader}
              onPress={() => toggleExpand(task.id)}
            >
              <TouchableOpacity
                style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
                onPress={() => handleTaskToggle(task.id)}
              >
                {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
              </View>
              <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            
            {isExpanded && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}
          </View>
        );
      })}
    </CenteredContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF8F0',
    borderColor: '#FFA500',
    borderWidth: 2,
    borderRadius: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f97316',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#4a4a4a',
    marginBottom: 8,
  },
  progress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
  },
  taskContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5CC',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#f97316',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#f97316',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111216',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  expandIcon: {
    fontSize: 12,
    color: '#f97316',
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 13,
    color: '#5a5a5a',
    marginTop: 8,
    marginLeft: 36,
    lineHeight: 18,
  },
});

export default ThanksgivingChallenge;
