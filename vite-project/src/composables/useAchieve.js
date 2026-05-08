import { computed, reactive } from 'vue';
import useTask from './useTask';

const { tasks } = useTask();

let savedStats = localStorage.getItem('stats');

if (savedStats) {
    savedStats = JSON.parse(savedStats);
} else {
    savedStats = {};
};

const stats = reactive({
    coins: savedStats.coins || 0,
    crystals: savedStats.crystals || 0,
    completedTasks: savedStats.completedTasks || 0,
    deletedTasks: savedStats.deletedTasks || 0,
    archivedTasks: savedStats.archivedTasks || 0,
    wins: savedStats.wins || 0,
    losses: savedStats.losses || 0
});

// выполненные задачи
const completedTasks = computed(() => {
    return tasks.value.filter((task) => task.isDone === true).length;
});

// задачи в архиве
const archivedTasks = computed(() => {
    return tasks.value.filter((task) => task.isArchive === true).length;
});

// список достижений
const achievementList = [
    {title: 'Первая монетка', description: 'Получите 1 монету', image: '/coin1.png', color: 'coin', target: 1, category: 'Монетки', stat: 'coins'},
    {title: 'Копейка к копейке', description: 'Соберите 10 монеток', image: '/coin10.png', color: 'coin', target: 10, category: 'Монетки', stat: 'coins'},
    {title: 'Монетный мешок', description: 'Соберите 50 монеток', image: '/coin50.png', color: 'coin', target: 50, category: 'Монетки', stat: 'coins'},
    {title: 'Золотой запас', description: 'Соберите 100 монеток', image: '/coin100.png', color: 'coin', target: 100, category: 'Монетки', stat: 'coins'},

    {title: 'Первый кристалл', description: 'Получите 1 кристалл', image: '/crystal1.png', color: 'crystal', target: 1, category: 'Кристаллы', stat: 'crystals'},
    {title: 'Блестящая десятка', description: 'Соберите 10 кристаллов', image: '/crystal10.png', color: 'crystal', target: 10, category: 'Кристаллы', stat: 'crystals'},
    {title: 'Кристальная жила', description: 'Соберите 50 кристаллов', image: '/crystal50.png', color: 'crystal', target: 50, category: 'Кристаллы', stat: 'crystals'},
    {title: 'Кристальный магнат', description: 'Соберите 100 кристаллов', image: '/crystal100.png', color: 'crystal', target: 100, category: 'Кристаллы', stat: 'crystals'},

    {title: 'Пять из пяти', description: 'Выполните 5 задач', image: '/task5.png', color: 'task', target: 5, category: 'Задачи', stat: 'completed'},
    {title: 'Разогнался', description: 'Выполните 15 задач', image: '/task15.png', color: 'task', target: 15, category: 'Задачи', stat: 'completed'},
    {title: 'Машина задач', description: 'Выполните 30 задач', image: '/task30.png', color: 'task', target: 30, category: 'Задачи', stat: 'completed'},
    {title: 'Ой, не то', description: 'Удалите 1 задачу', image: '/delTask.png', color: 'task', target: 1, category: 'Задачи', stat: 'deletedTasks'},
    {title: 'Я сдаюсь... потом', description: 'Отправьте 1 задачу в архив', image: '/archTask.png', color: 'archive', target: 1, category: 'Задачи', stat: 'archived'},

    {title: 'Охотник на врагов', description: 'Победите врагов 5 раз', image: '/win5.png', color: 'win', target: 5, category: 'Победы', stat: 'wins'},
    {title: 'Гроза врагов', description: 'Победите врагов 15 раз', image: '/win15.png', color: 'win', target: 15, category: 'Победы', stat: 'wins'},
    {title: 'Истребитель', description: 'Победите врагов 30 раз', image: '/win30.png', color: 'win', target: 30, category: 'Победы', stat: 'wins'},

    {title: 'Это была разведка', description: 'Проиграйте 1 раз', image: '/lose1.png', color: 'lose', target: 1, category: 'Поражения', stat: 'losses'},
    {title: 'Почти получилось', description: 'Проиграйте 5 раз', image: '/lose5.png', color: 'lose', target: 5, category: 'Поражения', stat: 'losses'},
    {title: 'Легенда фейлов', description: 'Проиграйте 15 раз', image: '/lose15.png', color: 'lose', target: 15, category: 'Поражения', stat: 'losses'}
];

const achievements = computed(() => {
    const result = [];


    for (let i = 0; i < achievementList.length; i++) {
        let progress = 0;

        if (achievementList[i].stat === 'completed') {
            progress = completedTasks.value;
        } else if (achievementList[i].stat === 'archived') {
            progress = archivedTasks.value;
        } else {
            progress = stats[achievementList[i].stat];
        };

        let percent = progress / achievementList[i].target * 100;

        if (percent > 100) {
            percent = 100;
        };

        result.push({
            title: achievementList[i].title,
            description: achievementList[i].description,
            image: achievementList[i].image,
            color: achievementList[i].color,
            progress: progress,
            target: achievementList[i].target,
            category: achievementList[i].category,
            percent: percent,
            isReceived: progress >= achievementList[i].target
        });
    };

    return result;
});

// полученные достижения
const receivedAchievements = computed(() => {
    let count = 0;

    for (let i = 0; i < achievements.value.length; i++) {
        if (achievements.value[i].isReceived === true) {
            count++;
        };
    };

    return count;
});

// количество достижений в категории
function countByCategory(category) {
    let count = 0;

    for (let i = 0; i < achievements.value.length; i++) {
        if (achievements.value[i].category === category) {
            count++;
        };
    };

    return count;
};

// экспорт всего и вся
export default function useAchieve() {
    return {
        stats,
        achievements,
        receivedAchievements,
        countByCategory
    };
};
