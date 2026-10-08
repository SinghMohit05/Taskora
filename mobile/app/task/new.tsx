import React, { useState } from 'react';
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
import { createTaskSchema, CreateTaskInput, TaskPriority, TaskStatus } from '@taskforge/shared';
import { useTaskMutations } from '../../src/hooks/useMutations';
import { useProjects } from '../../src/hooks/useProjects';
import { Input } from '../../src/components/Input';
import { Select } from '../../src/components/Select';
import { Button } from '../../src/components/Button';
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

export default function NewTaskScreen() {
  const { projectId: queryProjectId } = useLocalSearchParams<{ projectId?: string }>();
  const router = useRouter();

  const { data: projectsData, isLoading: isProjectsLoading } = useProjects({ limit: 100 });
  const { createTask } = useTaskMutations();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId: queryProjectId || '',
      name: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: undefined,
    },
  });

  const selectedPriority = watch('priority');
  const dueDate = watch('dueDate');

  const projectOptions = (projectsData?.projects || []).map((p) => ({
    label: p.name,
    value: p.id,
  }));

  const onSubmit = async (data: CreateTaskInput) => {
    createTask.mutate(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Project Selector (if not prefilled via params) */}
        {!queryProjectId && (
          <Controller
            control={control}
            name="projectId"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Assigned Project *"
                placeholder={isProjectsLoading ? 'Loading projects...' : 'Select a project'}
                value={value}
                options={projectOptions}
                onSelect={onChange}
                error={errors.projectId?.message}
              />
            )}
          />
        )}

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
            title="Create Task"
            variant="primary"
            size="md"
            onPress={handleSubmit(onSubmit)}
            isLoading={createTask.isPending}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.paper,
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
});
