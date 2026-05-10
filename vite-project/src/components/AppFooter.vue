<template>
    <footer class="footer">
        <div class="footer_inner">
            <RouterLink to="/" class="footer_logo">
                <div class="logo_icon"><img src="/icons/logo.svg" alt="ToDo logo"></div>
                <h2>ToDo</h2>
            </RouterLink>

            <div class="footer_columns">
                <div class="footer_column">
                    <h3>Навигация</h3>

                    <RouterLink to="/">Главная</RouterLink>
                    <RouterLink to="/timer">Фокусировка</RouterLink>
                    <RouterLink to="/achievements">Достижения</RouterLink>
                    <RouterLink to="/aquarium">Игра</RouterLink>
                </div>

                <div class="footer_column">
                    <h3>Контакты</h3>

                    <p>+7 (924) 809 - 88 - 06</p>
                    <p>SnackChiter@mail.ru</p>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    margin-top: 40px;
    padding: 42px 0;

    background: #ffffff;
    border-radius: 18px 18px 0 0;

    font-family: 'Jost', Arial, sans-serif;
}

.footer_inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.footer_logo {
    display: flex;
    align-items: center;
    gap: 14px;

    color: #0d1627;
    text-decoration: none;
}

.logo_icon {
    width: 38px;
    height: 38px;

    background: #2f80ed;
    color: #ffffff;
    border-radius: 6px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 22px;
    font-weight: 600;
}

.footer_logo h2 {
    margin: 0;

    font-size: 28px;
    font-weight: 700;
}

.footer_columns {
    display: flex;
    gap: 70px;
}

.footer_column {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.footer_column h3 {
    margin: 0 0 8px;

    color: #0d1627;
    font-size: 16px;
    font-weight: 600;
}

.footer_column a,
.footer_column p {
    margin: 0;

    color: #0d1627;
    text-decoration: none;
    font-size: 14px;
}

.footer_column a:hover {
    color: #2f80ed;
}
</style>