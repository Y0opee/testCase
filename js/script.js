//Переменные для обращения к блокам
const DOM_mediaplan_list = document.getElementById('main__file-mediaplan-list');
const DOM_report_list = document.getElementById('main__file-report-list');
const filesList = document.querySelector('.main__files-list');
const morefiles = document.querySelectorAll('.main__file-showmore');
const email = document.querySelector('.header__user-email').textContent;        //получаем email

var arr_mediaplans = [];
var arr_reports = [];

//Функция получения даты
let getCurrentDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${year}`;
}
//функция времени
let getCurrentTime = () => {
  let currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');     // не забываем про 0 перед однозначным числом
  const minutes = currentTime.getMinutes().toString().padStart(2, '0'); // 
  return `${hours}:${minutes}`;
}
// Функция получения имени компании //в теории надо проверять на длину, но тогда не оч понятно, как пользователь должен по дате ориентироваться
let getCompanyName = (sstring) => {
  let cname = sstring.split('@')[0];                  //чисто условно будем тянуть название от имени пользователя из email
  if (cname.length < 4) return cname;
  if (cname.length > 4) return cname.substring(0,4);  
}
//Функция, чтобы спрятать "заглушки" для чата и товаров класс ".cap"
let hideCap = (type) =>{
  if (type === 'chat'){
    document.querySelector('.main__chat-cap').style.display = 'none';
    document.querySelector('.main__chat-talk').style.display = 'flex';
  }
  if (type === 'file'){
    document.querySelector('.main__files-cap').style.display = 'none';
    document.querySelector('.main__chat-cap').style.display = 'none';
  }

}
//Функция оповещения в чат
// let addNotificationToChat = (name, type, status) => {
//   const chatTalk = document.querySelector('.main__chat-talk');
//   const template = document.getElementById('notification-template');
//   const clone = template.content.cloneNode(true);
  
//   clone.querySelector('.notification__name').textContent = `${type}: ${name}`;
//   clone.querySelector('.notification__status').textContent = status;
//   clone.querySelector('.notification__time').textContent = getCurrentTime();
  
//   chatTalk.appendChild(clone);
//   setTimeout(scrollChatToBottom, 50);
// }
//функция скроллинга чата
let scrollChatToBottom = () => {
  const chatTalk = document.querySelector('.main__chat-talk');
  chatTalk.scrollTo({
    top: chatTalk.scrollHeight,
    behavior: 'smooth' // плавная прокрутка
  });
}
//выносим логику из кнопки отправить сообщение и добавляем ее в функцию
//Функция отправки сообщения
let sendMessage = (message, isMyMessage = true) => {
  hideCap('chat'); //прячем CAP

  document.querySelector('.main__chat-date').textContent = `Сегодня, ${getCurrentTime()}`
  const chatTalk = document.querySelector('.main__chat-talk')
  const template = document.getElementById('message-template');
  const clone = template.content.cloneNode(true);
  clone.querySelector('.message__text').textContent = message;
  clone.querySelector('.message__time').textContent = getCurrentTime();
  
  //Убираем фото и имя, если сообщение от нас
  if (isMyMessage){
    clone.querySelector('.message__container').classList.add('my-message');
    clone.querySelector('.message__image-container').style.display = 'none';
    clone.querySelector('.message__owner').style.display = 'none';
  }

  chatTalk.appendChild(clone); 
  
  // вызываем прокрутку, с небольшим делеем
  setTimeout(scrollChatToBottom, 50);
}

//Функция для проверки статусов/иконок и добавления template для file
let renderList= (fileList, arrayOffile, maxItems) => {
  fileList.innerHTML = ''; // Очищаем список

  const itemsToShow = arrayOffile.slice(-maxItems).reverse(); // слайсим последние элементы массива и переворачиваем
  
  itemsToShow.forEach((item, index) => {
    const template = document.getElementById('document-template-id');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.document__name').textContent = `${item.companyName}#${arrayOffile.indexOf(item)+1} ${item.date}`; //формируем имя
    //Блок статуса/action button, плодим константы, для может быть более удобной работы
    const statusWrapper =     clone.querySelector('.document__status');
    const statusIndicator =   clone.querySelector('.document__status-indicator');
    const statusText =        clone.querySelector('.document__status-text');          //статус
    const actionButton =      clone.querySelector('.document__action-button');
    const downLoadicon =      clone.querySelector('.document__action-download');
    const refreshicon =       clone.querySelector('.document__action-refresh');       //кнопка document-item

    // Меняем иконки согласно статусу. Иконки: download/refresh
    if (item.status === 'success') {
      downLoadicon.style.display = 'block';
      refreshicon.style.display = 'none';
      actionButton.style.backgroundColor = '';
    } else if (item.status === 'processing') {
      downLoadicon.style.display = 'none';
      refreshicon.style.display = 'block';
      actionButton.style.backgroundColor = 'rgba(148, 148, 148, 1)';
    }

    // В зависимости от выпавшего статуса отрисовываем стили статуса (иконка + текст)
    if (index === 0) {
      statusWrapper.style.display = 'flex';
      if (item.status === 'success') {  // Если успех, то выставляем текст статуса. - Нечитаемая ерунда, но более компактно
        statusIndicator.style.backgroundColor = 'rgba(28, 195, 55, 1)';
        
        statusText.textContent = fileList === DOM_mediaplan_list ? `Медиаплан от ${item.date} готов` : `Отчет от ${item.date} готов`;
      } else {                          // В противном случае выставляем текст, для еще не сформированного
        statusIndicator.style.backgroundColor = 'rgba(148, 148, 148, 1)';
        statusText.textContent = fileList === DOM_mediaplan_list ? `Медиаплан в процессе составления`: `Отчет формируется`;
      }
    } else {
      statusWrapper.style.display = 'none'; // Скрываем статус для остальных
    }

    //Создаем блок li с классом "document__item" и добавляем в список
    const listItem = document.createElement('li');
    listItem.className = 'document__item';
    listItem.appendChild(clone);
    
    fileList.appendChild(listItem);
  });
}

//Выносим пересечения по функционалу кнопок в отдельную функцию
//Функция рендера filelist
let orderBut = (fileList, arrayOffile, indexOfshow, maxItemsDesk, maxItemsMobile, status = 'processing') => {
  const newFile = {
    companyName: getCompanyName(email),
    date: getCurrentDate(),
    status: status // Используем переданный статус
  };
  
  arrayOffile.push(newFile);

  //формируем имя файла
  const fname = `${newFile.companyName}#${arrayOffile.length} ${newFile.date}`; 

  // прячем заглушки (cap классы), показываем ссылку "показать еще" в блоке файлы
  hideCap('file');
  morefiles[indexOfshow].style.display = 'block';

  // Настройка flex-направления
  filesList.style.display = 'flex';
  if (window.matchMedia('(min-width: 375px) and (max-width: 1409px)').matches) {
    filesList.style.flexDirection = 'row';    // Для 768 -1409
  } else {
    filesList.style.flexDirection = 'column'; // Для 375px и 1440px
  }

  // // Добавляем уведомление в чат
  // addNotificationToChat(
  //   fname, 
  //   fileList === DOM_mediaplan_list ? 'Медиаплан' : 'Отчет',
  //   fileList === DOM_mediaplan_list ? 'в процессе составления' : 'формируется'
  // );

  // Проверяем разрешение и Удаляем 6+ элемент или 5+ при 768px
  if (window.matchMedia('(min-width: 376px) and (max-width: 1409px)').matches) {
    renderList(fileList, arrayOffile, maxItemsMobile);
  } else {
    renderList(fileList, arrayOffile, maxItemsDesk);
  }
}
//Функция для проверки flex-direction
let checkFlex = () => { 
  const windowWidth = window.innerWidth;
  if (filesList.style.display == 'none'){return}
  if (windowWidth > 1410 && filesList.style.display !== 'none') filesList.style.flexDirection = 'column';
  if (windowWidth < 1410 && filesList.style.display !== 'none') filesList.style.flexDirection = 'row';
}
//Функция "заглушка" - backend-запроса
async function fakeBackendRequest(type, data) {
  // Имитация задержки
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Эмуляция разных ответов
  const responses = {
    mediaplan: {
      success:  Math.random() > 0.2,
      message:  "Медиаплан успешно создан!",
      error:    "Ошибка генерации медиаплана"
    },
    report: {
    success:    Math.random() > 0.2,
      message:  "Отчет готов к скачиванию",
      error:    "Сервис отчетов временно недоступен"
    }
  };

  if (!responses[type]) throw new Error('Неизвестный тип запроса');
  
  return responses[type].success 
    ? { status: 'success', message: responses[type].message, data }
    : { status: 'error', message: responses[type].error };
}
//Функция логики кнопки enter (вывели в отдельную функцию, чтобы не дублировать текст на клавишу )
let handleMessageSend = (message) => {
  sendMessage(message, true);
  
  setTimeout(() => {
    const randomResponses = [
      "Запрос принят в обработку",
      "Ваше сообщение получено",
      "Спасибо за запрос!",
      "Подождите 2-3 минуты..."
    ];
    const randomResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    sendMessage(randomResponse, false);
  }, 1000);
}
//Кнопки
//////////////////////////////////////////////////////////////////////////////////////////////////
// Обработчики кнопок "Заказать"
//Медиаплан
document.querySelector('.main__chat-mediaplanorder').addEventListener('click', async() => {
  try {
    sendMessage("Отправляю запрос на медиаплан...", true);
    
    // Сразу создаем файл со статусом "processing"
    orderBut(DOM_mediaplan_list, arr_mediaplans, 0, 4, 4, 'processing');
    
    const response = await fakeBackendRequest('mediaplan', {
      company: getCompanyName(email),
      date: getCurrentDate()
    });
    
    if (response.status === 'success') {
      sendMessage(response.message, false);
      // Обновляем статус последнего файла
      arr_mediaplans[arr_mediaplans.length - 1].status = 'success';
      renderList(DOM_mediaplan_list, arr_mediaplans, 4);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    sendMessage(`Ошибка: ${error.message}`, false);
    // Статус остается "processing"
  }
});
//Отчет
document.querySelector('.main__chat-reportorder').addEventListener('click', async () => {
  try {
    sendMessage("Формирую отчет...", true);
    // Создаем с начальным статусом
    orderBut(DOM_report_list, arr_reports, 1, 3, 3, 'processing');
    
    const response = await fakeBackendRequest('report', {
      company: getCompanyName(email),
      date: getCurrentDate()
    });
    
    if (response.status === 'success') {
      sendMessage(response.message, false);
      // Обновляем статус
      arr_reports[arr_reports.length - 1].status = 'success';
      renderList(DOM_report_list, arr_reports, 3);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    sendMessage(`Ошибка отчета: ${error.message}`, false);
  }
});

//Обработка нажатия на toggle возле заголовка Медиаплан и Отчет. Коль на макете есть toggle элемент, чего б не добавить
document.getElementById('main__file-toggle--mediaplan').addEventListener('click', async function (e) {
  if(DOM_mediaplan_list.style.display == 'none'){
    DOM_mediaplan_list.style.display = 'flex';
  }else{
    DOM_mediaplan_list.style.display = 'none';
  };
})
document.getElementById('main__file-toggle--report').addEventListener('click', async function (e) {
  if(DOM_report_list.style.display == 'none'){
    DOM_report_list.style.display = 'flex';
  }else{
    DOM_report_list.style.display = 'none';
  };
})

//обработчик нажатия button Enter
document.getElementById('send_button').addEventListener('click', function() {
  const input = document.querySelector('.main__chat-textarea');
  const message = input.value.trim();
  if (message) {
    input.value = '';
    handleMessageSend(message);
  }
});

//обработчик нажатия клавиши Enter
document.querySelector('.main__chat-textarea').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const message = e.target.value.trim();
    if (!message) return;
    
    e.target.value = '';
    handleMessageSend(message);
  }
});

//Проверяем изменения окна, чтобы проверять flex-direction у file-list
window.addEventListener('resize', checkFlex);