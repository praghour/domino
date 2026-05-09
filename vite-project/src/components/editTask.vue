<script setup>
import { reactive, watch } from 'vue';
import useTask from '../composables/useTask';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    task: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'save']);

const { prepareTaskData } = useTask();

const form = reactive({
    name: '',
    description: '',
    subtasks: ['', '', '', ''],
    date: '',
    priority: 'Низкий'
});

const errors = reactive({
    name: '',
    date: '',
    priority: ''
});

// заполнение формы
function fillForm(task) {
    if (!task) {
        return;
    };

    form.name = task.name || '';
    form.description = task.description || '';
    form.date = task.date || '';
    form.priority = task.priority || 'Низкий';

    if (task.subtasks && task.subtasks.length) {
        form.subtasks = [
            task.subtasks[0] || '',
            task.subtasks[1] || '',
            task.subtasks[2] || '',
            task.subtasks[3] || ''
        ];
    } else {
        form.subtasks = ['', '', '', ''];
    };

    clearErrors();
};

// когда открывается модалка
watch(
    () => props.modelValue,
    () => {
        if (props.modelValue) {
            fillForm(props.task);
        };
    }
);

// когда меняется выбранная задача
watch(
    () => props.task,
    () => {
        if (props.modelValue) {
            fillForm(props.task);
        };
    }
);

// выбор приоритета
function choosePriority(priority) {
    form.priority = priority;
};

// очистка ошибок
function clearErrors() {
    errors.name = '';
    errors.date = '';
    errors.priority = '';
};

// проверка формы
function validateForm() {
    clearErrors();

    if (!form.name.trim()) {
        errors.name = 'Введите название задачи';
    };

    if (!form.date) {
        errors.date = 'Выберите дату';
    };

    if (!form.priority) {
        errors.priority = 'Выберите приоритет';
    };

    return !errors.name && !errors.date && !errors.priority;
};

// закрытие модального окна
function closeModal() {
    clearErrors();
    emit('update:modelValue', false);
};

// сохранение задачи
function saveTask() {
    if (!validateForm()) {
        return;
    };

    const editedTask = prepareTaskData(form);

    emit('save', editedTask);
    emit('update:modelValue', false);
};
</script>


<template>
    <div v-if="props.modelValue" class="modal_overlay" @click.self="closeModal">
        <form class="modal" @submit.prevent="saveTask">
            <div class="modal_header">
                <h2>Редактировать задачу</h2>

                <button type="button" class="close_button" @click="closeModal">
                    ×
                </button>
            </div>

            <div class="form_group">
                <label>Название</label>

                <input v-model="form.name" type="text" placeholder="Введите название задачи">

                <p v-if="errors.name" class="error">
                    {{ errors.name }}
                </p>
            </div>

            <div class="form_group">
                <label>Описание</label>

                <textarea v-model="form.description" placeholder="Введите описание задачи"></textarea>
            </div>

            <div class="form_group">
                <label>Подзадачи</label>

                <div class="subtasks">
                    <input v-for="(subtask, index) in form.subtasks" v-model="form.subtasks[index]" type="text" placeholder="Введите подзадачу">
                </div>
            </div>

            <div class="form_group">
                <label>Дата</label>

                <input v-model="form.date" type="date">

                <p v-if="errors.date" class="error">
                    {{ errors.date }}
                </p>
            </div>

            <div class="form_group">
                <label>Приоритет</label>

                <div class="priority_buttons">
                    <button
                        type="button"
                        class="priority_button low"
                        :class="{ selected: form.priority === 'Низкий' }"
                        @click="choosePriority('Низкий')"
                    >
                        <span></span>
                        Низкий
                    </button>

                    <button
                        type="button"
                        class="priority_button medium"
                        :class="{ selected: form.priority === 'Средний' }"
                        @click="choosePriority('Средний')"
                    >
                        <span></span>
                        Средний
                    </button>

                    <button
                        type="button"
                        class="priority_button high"
                        :class="{ selected: form.priority === 'Высокий' }"
                        @click="choosePriority('Высокий')"
                    >
                        <span></span>
                        Высокий
                    </button>
                </div>

                <p v-if="errors.priority" class="error">
                    {{ errors.priority }}
                </p>
            </div>

            <div class="modal_actions">
                <button type="button" class="cancel_button" @click="closeModal">
                    Отмена
                </button>

                <button type="submit" class="create_button">
                    Сохранить
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.modal_overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;

    background: rgba(13, 22, 39, 0.45);

    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    width: 552px;
    max-height: calc(100vh - 40px);

    padding: 20px;
    box-sizing: border-box;

    background: #ffffff;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    gap: 40px;

    overflow-y: auto;
    overflow-x: hidden;

    font-family: 'Jost', Arial, sans-serif;

    scrollbar-width: none;
    -ms-overflow-style: none;
}

.modal::-webkit-scrollbar {
    display: none;
}

.modal_header {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal_header h2 {
    margin: 0;

    color: #0d1627;
    font-size: 24px;
    font-weight: 500;
    line-height: 35px;
}

.close_button {
    width: 24px;
    height: 24px;

    padding: 0;
    border: none;
    background: transparent;

    color: #0d1627;
    font-size: 32px;
    line-height: 24px;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;
}

.form_group {
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 11px;
}

.form_group label {
    color: #0d1627;
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;
}

.form_group input,
.form_group textarea {
    width: 100%;

    padding: 10px;

    border: 1px solid #e5eaf1;
    border-radius: 10px;
    background: #ffffff;

    color: #0d1627;
    font-size: 16px;
    font-weight: 400;
    font-family: inherit;
    line-height: 23px;

    outline: none;
    box-sizing: border-box;
}

.form_group input {
    height: 43px;
}

.form_group textarea {
    height: 116px;
    resize: none;
}

.form_group input::placeholder,
.form_group textarea::placeholder {
    color: #67758a;
}

.form_group input:focus,
.form_group textarea:focus {
    border-color: #2d78f5;
}

.subtasks {
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 11px;
}

.subtasks input {
    width: 100%;
    height: 43px;
}

.priority_buttons {
    width: 100%;

    display: flex;
    gap: 12px;
}

.priority_button {
    width: 100%;
    height: 48px;

    padding: 14px 20px;

    border: 1px solid #e5eaf1;
    border-radius: 10px;
    background: #ffffff;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    color: #0d1627;
    font-size: 14px;
    font-weight: 400;
    font-family: inherit;
    line-height: 20px;

    cursor: pointer;
}

.priority_button.selected {
    background: #dbeafd;
}

.priority_button span {
    width: 10px;
    height: 10px;

    display: block;
    border-radius: 50%;
}

.priority_button.low span {
    background: #48c36b;
}

.priority_button.medium span {
    background: #ef8922;
}

.priority_button.high span {
    background: #dd5351;
}

.error {
    margin: 0;

    color: #dd5351;
    font-size: 13px;
    line-height: 18px;
}

.modal_actions {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}

.cancel_button,
.create_button {
    height: 43px;

    padding: 10px 20px;

    border: none;
    border-radius: 10px;

    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;

    cursor: pointer;
}

.cancel_button {
    width: 110px;

    background: #eff3f8;
    color: #66748a;
}

.create_button {
    width: 115px;

    background: #2d78f5;
    color: #fefefe;
}
</style>
