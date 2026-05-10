<template>
    <header class="header">
        <RouterLink to="/" class="logo">
            <div class="logo_icon"><img src="/icons/logo.svg" alt="ToDo logo"></div>

            <div class="logo_text">
                <h1>ToDo</h1>
                <p>Планируйте задачи и достигайте целей каждый день</p>
            </div>
        </RouterLink>

        <nav class="nav">
            <RouterLink :to="{ name: 'main' }">Главная</RouterLink>
            <RouterLink :to="{ name: 'timer' }">Фокусировка</RouterLink>
            <RouterLink :to="{ name: 'achievements' }">Достижения</RouterLink>
            <RouterLink :to="{ name: 'aquarium' }">Игра</RouterLink>
        </nav>
    </header>
</template>

<style scoped>
.header {
    width: calc(100% - 80px);
    max-width: 1362px;
    height: 70px;

    margin: 29px auto 38px;
    padding: 14px 20px;

    display: flex;
    flex-direction: row;
    align-items: center;

    background: #FEFEFE;
    border-radius: 16px;

    font-family: 'Jost', Arial, sans-serif;
}

.logo {
    width: 339px;
    height: 42px;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;

    text-decoration: none;
    color: #0D1627;
}

.logo_icon {
    width: 60px;
    height: 60px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 6px;

    background: #2B78F4;
    border-radius: 4px;

    color: #FFFFFF;
    font-size: 22px;
    font-weight: 600;
    line-height: 1;
}

.logo {
    width: 339px;
    height: 42px;

    display: flex;
    align-items: center;
    gap: 12px;

    text-decoration: none;
    color: #0D1627;
}

.logo_icon {
    width: 42px;
    height: 42px;

    min-width: 42px;
    min-height: 42px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #2B78F4;
    border-radius: 4px;

    overflow: hidden;
}

.logo_icon img {
    width: 18px;
    height: 18px;
    display: block;
}

.logo_text {
    height: 42px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    gap: 2px;

    text-align: left;
}

.logo_text h1 {
    margin: 0;

    font-family: 'Jost', Arial, sans-serif;
    font-weight: 600;
    font-size: 32px;
    line-height: 32px;

    color: #0D1627;
    text-align: left;
}

.logo_text p {
    margin: 0;

    font-family: 'Jost', Arial, sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 12px;

    color: #000000;
    opacity: 0.5;

    text-align: left;
}

.nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;

    margin-left: auto;
}

.nav a {
    font-family: 'Jost', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;

    color: #000000;
    text-decoration: none;
}

.nav a:hover {
    color: #2B78F4;
}

.nav a.router-link-active {
    color: #2B78F4;
}
</style>