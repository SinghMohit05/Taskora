import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateTaskSchema, UpdateTaskInput, TaskPriority, TaskStatus } from '@taskforge/shared';
import { useTask } from '../../src/hooks/useTasks';
import { useTaskMutations } from '../../src/hooks/useMutations';
import { Input } from '../../src/components/Input';
import { Select } from '../../src/components/Select';
import { Button } from '../../src/components/Button';
import { ErrorState } from '../../src/components/ErrorState';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { colors, spacing, typography } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate, toISODate } from '../../src/utils/date';

const statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
];

const priorityLevels: TaskPriority[] = ['Low', 'Medium', 'High'];

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: task, isLoading, isError, refetch } = useTask(id);
  const { updateTask, deleteTask } = useTaskMutations();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      name: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        name: task.name,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
      });
    }
  }, [task, reset]);

  const selectedPriority = watch('priority');
  const dueDate = watch('dueDate');

  const onSubmit = async (data: UpdateTaskInput) => {
    updateTask.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  const handleDelete = () => {
    deleteTask.mutate(id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        router.back();
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View style={styles.centerContainer}>
        <ErrorState onRetry={refetch} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Task Title *"
              placeholder="e.g. Design authentication modal"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Description"
              placeholder="Detailed acceptance criteria or implementation notes"
              multiline
              numberOfLines={3}
              value={value || ''}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.description?.message}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* Priority Segmented Control */}
        <View style={styles.segmentSection}>
          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.segmentedControl}>
            {priorityLevels.map((p) => {
              const isSelected = selectedPriority === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setValue('priority', p)}
                  style={[styles.segmentBtn, isSelected && styles.segmentBtnSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Status"
              value={value}
              options={statusOptions}
              onSelect={onChange}
              error={errors.status?.message}
            />
          )}
        />

        {/* Due Date Picker */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>Due Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            accessibilityRole="button"
            accessibilityLabel="Pick due date"
          >
            <Ionicons name="calendar-outline" size={18} color={colors.steel} />
            <Text style={styles.dateButtonText}>
              {dueDate ? formatDate(dueDate) : 'No deadline set'}
            </Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate ? new Date(dueDate) : new Date()}
            mode="date"
            display="default"
            onChange={(_event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setValue('dueDate', toISODate(selectedDate), { shouldValidate: true });
              }
            }}
          />
        )}

        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            variant="outline"
            size="md"
            onPress={() => router.back()}
            style={styles.button}
          />
          <Button
            title="Save Changes"
            variant="primary"
            size="md"
            onPress={handleSubmit(onSubmit)}
            isLoading={updateTask.isPending}
            style={styles.button}
          />
        </View>

        <Button
          title="Delete Task"
          variant="danger"
          size="md"
          onPress={() => setShowDeleteConfirm(true)}
          icon={<Ionicons name="trash-outline" size={18} color={colors.white} />}
          style={styles.deleteTaskBtn}
        />

        <ConfirmDialog
          visible={showDeleteConfirm}
          title="Delete Task"
          message={`Are you sure you want to delete "${task.name}"?`}
          confirmTitle="Delete"
          isDestructive={true}
          isLoading={deleteTask.isPending}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.paper,
  },
  loadingText: {
    ...typography.caption,
    color: colors.muted,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  segmentSection: {
    marginBottom: spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.subtle,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: 3,
    minHeight: 44,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius - 2,
    paddingVertical: 8,
  },
  segmentBtnSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    ...typography.captionBold,
    color: colors.muted,
  },
  segmentTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dateSection: {
    marginBottom: spacing.xl,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.ash,
    borderRadius: spacing.borderRadius,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.ink,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
  deleteTaskBtn: {
    marginTop: spacing.lg,
  },
});
