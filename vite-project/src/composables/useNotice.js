import { ref } from 'vue';

const notice = ref({
    title: '',
    description: ''
});

const isNoticeVisible = ref(false);

function showNotice(title, description) {
    notice.value.title = title;
    notice.value.description = description;

    isNoticeVisible.value = true;

    setTimeout(() => {
        isNoticeVisible.value = false;
        notice.value.title = '';
        notice.value.description = '';
    }, 3000);
};

// экспорт всего и вся
export default function useNotice() {
    return {
        notice, isNoticeVisible,
        showNotice
    };
};