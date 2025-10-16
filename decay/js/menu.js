// js/menu.js
const menuButton = document.getElementById('menuButton');
const slideInMenu = document.getElementById('slideInMenu');
const body = document.body;
const container1 = document.querySelector('.container');
const heading = document.querySelector('h1');
const buttons = document.querySelectorAll('.button');
const field = document.querySelector('.field');
const analyzer = document.querySelector('.analyzer');

menuButton.addEventListener('click', () => {
    slideInMenu.classList.toggle('open');
    body.classList.toggle('menu-open');
    if (container1) {
        container1.classList.toggle('menu-open');
    }
    if (heading) {
        heading.classList.toggle('menu-open');
    }
    buttons.forEach(button => {
        button.classList.toggle('menu-open');
    });
    if (field) {
        field.classList.toggle('menu-open');
    }
    if (analyzer) {
        analyzer.classList.toggle('menu-open');
    }
});