import { ref } from 'vue';

const noticeText = ref('');
const isNoticeVisible = ref(false);

function showNotice(text) {
    noticeText.value = text;
    isNoticeVisible.value = true;

    setTimeout(() => {
        isNoticeVisible.value = false;
        noticeText.value = '';
    }, 3000);
};

// экспорт всего и вся
export default function useNotice() {
    return {
        noticeText, isNoticeVisible,
        showNotice
    };
};