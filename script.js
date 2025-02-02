let currentIndex = 0;

$(document).ready(function(){

    var nav = $("#nav ul");

    $(".toggleMenu").click(function(e){
        e.preventDefault();
        nav.slideToggle(500);
    });

    $(window).resize(function() {
        let width = $(window).width();
        if(width > 992) {
          nav.removeAttr('style');
        }
      });
    


// Мок-дані для пошуку (замість цього можна динамічно завантажувати з сервера)
// const siteContent = [
//     { title: 'Home', url: 'index.html', content: 'Welcome to our homepage!' },
//     { title: 'About Us', url: 'about.html', content: 'Learn more about our mission and vision.' },
//     { title: 'Services', url: 'services.html', content: 'We offer web development and design services.' },
//     { title: 'Contact', url: 'contact.html', content: 'Get in touch with us for more information.' }
// ];

// document.getElementById('search-btn').addEventListener('click', performSearch);

// document.getElementById('search-input').addEventListener('keyup', function (event) {
//     if (event.key === 'Enter') {
//         performSearch();
//     }
// });

// function performSearch() {
//     const query = document.getElementById('search-input').value.trim().toLowerCase();
//     const resultsList = document.getElementById('results-list');

//     // Очистити попередні результати
//     resultsList.innerHTML = '';

//     if (query) {
//         const filteredResults = siteContent.filter(item =>
//             item.title.toLowerCase().includes(query) ||
//             item.content.toLowerCase().includes(query)
//         );

//         if (filteredResults.length > 0) {
//             filteredResults.forEach(result => {
//                 const listItem = document.createElement('li');
//                 listItem.innerHTML = `<a href="${result.url}">${result.title}</a> - ${result.content}`;
//                 resultsList.appendChild(listItem);
//             });
//         } else {
//             resultsList.innerHTML = '<li>Нічого не знайдено</li>';
//         }
//     } else {
//         alert('Будь ласка, введіть текст для пошуку');
//     }
// }

});