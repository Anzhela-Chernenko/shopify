 fetch('./tickets.json')
    .then(res => res.json())
    .then(data => {
        let container = document.querySelector("movie-component");
        let movieList = document.createElement("ul");

        data.forEach(el => {
            let listItem = document.createElement("li");
            listItem.setAttribute("data-id", el.id);
            listItem.textContent = el.title;
            listItem.addEventListener("click", openFilmCard );

            let thumbnail = document.createElement("img");
            thumbnail.setAttribute("src", el.thumbnail);
            thumbnail.setAttribute("alt", el.title);

            listItem.appendChild(thumbnail);
            movieList.appendChild(listItem);
        });
        document.cookie = `movie=${encodeURIComponent(JSON.stringify(data))}; max-age=604800`;
        container.appendChild(movieList);
    });

 const selectSits = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

 function openFilmCard(e) {
     const id = e.currentTarget.getAttribute("data-id");
     let popUpFilmCard = document.createElement("div");
     popUpFilmCard.className = "pop-up-film-card fade-in";
     let popUpFilmCardWrapper = document.createElement("div");
     popUpFilmCardWrapper.className = "pop-up-film-wrapper";
     let selectTime = showTime('10:00', '20:00', 2);
     let selectTimeHtml = "";

     selectTime.forEach(time => {

         selectTimeHtml += `<option>${time}</option>`;
     });


     let selectSitsHtml = "";
     selectSits.forEach(function(sit, i) {
         if(i === 0){
             selectSitsHtml += `<label for="sit-${sit}">${sit}
                <input id="sit-${sit}" data-name="input" value="${sit}" type="radio" required name="seats">
            </label>`;
         }else {
             selectSitsHtml += `<label for="sit-${sit}">${sit}
                <input id="sit-${sit}" data-name="input" value="${sit}" type="radio" name="seats">
            </label>`;
         }
     });

     popUpFilmCardWrapper.innerHTML = `<form>
        <h3>${filmItemData(id, "title")}</h3>
        <p>
            <label class="itemDate" for="date">Date:
             <input type="date" data-name="input" id="date" name="film" value="${currentDate()}" min="${currentDate()}" max="${filmItemData(id, "available")}" />
            </label>
               
            </p>
        <p>
        <label for="time">Time:</label>
         <select id="timeCustom" data-name="input">
           ${selectTimeHtml}
          </select>
        </p>
        <div class="screenWrap"><span>Available seats:</span></div>
        <div class="seats-wrapper">
          ${selectSitsHtml}
        </div>
        <input type="submit" value="Booking">
    </form>`;

     let closeButton = document.createElement("button");
     closeButton.innerHTML = "X";
     closeButton.className = "close-button";
     closeButton.addEventListener("click", function () {
         popUpFilmCard.classList.add("fade-out");
         setTimeout(function() {
             popUpFilmCard.remove();
         }, 1000);
     });

     popUpFilmCardWrapper.appendChild(closeButton);
     popUpFilmCard.append(popUpFilmCardWrapper);
     let popUpFilmCardForm = popUpFilmCardWrapper.querySelector("form");
     let bookedCustomerCookies = getCookiesStartingWith('booked-customer');
     let checkedData = popUpFilmCardWrapper.querySelectorAll("form [data-name=\"input\"]");
     updateChange(bookedCustomerCookies,id,checkedData,popUpFilmCardWrapper);
     popUpFilmCardForm.addEventListener("submit", function (element){
         element.preventDefault();
         let reserveDate = element.currentTarget.date.value;
         let reserveTime = element.currentTarget.timeCustom.value;
         let reserveSit = element.currentTarget.querySelector('input[name="seats"]:checked') && element.currentTarget.querySelector('input[name="seats"]:checked').value;
         let resTitle = filmItemData(id, "title");
         if (reserveDate !== null && reserveTime !== null && reserveSit !== null && resTitle !== null) {
             let result = [reserveDate,reserveTime,reserveSit,resTitle];
             document.cookie = `booked-customer${reserveDate}${reserveTime}${reserveSit}${resTitle}=${encodeURIComponent(JSON.stringify(result))}; max-age=604800`;
             bookedCustomerCookies = getCookiesStartingWith('booked-customer');
             showPopup();
             updateChange(bookedCustomerCookies,id,checkedData,popUpFilmCardWrapper);
         }
     });
     popUpFilmCardForm.addEventListener("change", function (element){
         updateChange(bookedCustomerCookies,id,checkedData,popUpFilmCardWrapper);
     });
     document.body.append(popUpFilmCard);
 }

 function updateChange(bookedCustomerCookies,id,checkedData,popUpFilmCardWrapper){
     checkedData.forEach(el=>{
         el.removeAttribute("disabled");
         el.parentNode.removeAttribute("disabled","disabled");
     });

     console.log(">>>", bookedCustomerCookies);


     bookedCustomerCookies.forEach(elem => {
         let filmTitle = filmItemData(id, "title");
         checkedData.forEach(el=>{

             if(elem.value[3] === filmTitle && elem.value.includes(popUpFilmCardWrapper.querySelector("#date").value) && elem.value.includes(popUpFilmCardWrapper.querySelector("#timeCustom").value) ){

                 if(elem.value[2] === el.value){
                     const timeOptionList = popUpFilmCardWrapper.querySelectorAll("#timeCustom option");
                     timeOptionList.forEach(time =>{
                         const selectedItems = selectItemsWithSameTimeAndTitle(bookedCustomerCookies, time.innerText, filmItemData(id, "title"));

                         if(selectedItems.length >= selectSits.length){
                             time.removeAttribute("disabled");
                             time.setAttribute("disabled","disabled");
                         }
                     });
                     el.setAttribute("disabled","disabled");
                     el.parentNode.setAttribute("disabled","disabled");
                 }
             }
         })
     })
 }

 function currentDate(){
     const currentDate = new Date();
     const day = currentDate.getDate();
     const month = currentDate.getMonth() + 1;
     const year = currentDate.getFullYear();
     let formattedDate = year + (day < 10 ? '0' : '') + '-' + (month < 10 ? '0' : '') + month + '-'+ day  ;
     return formattedDate;
 }

 function filmItemData(id, param){
     const allCookies = document.cookie;
     const movieCookie = allCookies.split(';').find(cookie => cookie.trim().startsWith('movie='));
     let result = "";

     let movieData;
     if (movieCookie) {
         const cookieValue = movieCookie.split('=')[1];
         movieData = JSON.parse(decodeURIComponent(cookieValue));
     }
     movieData.forEach(el=>{
          if(el.id === id){
              result = el[param];
          }
        })
     return result;
 }

 function showTime(startTime, endTime, step) {
     const startDate = new Date(`2023-01-01 ${startTime}`);
     const endDate = new Date(`2023-01-01 ${endTime}`);
     let currentTime = startDate;
     let result = [];
     while (currentTime <= endDate) {
         const formattedTime = currentTime.toLocaleTimeString('en-US', {
             hour: '2-digit',
             minute: '2-digit',
             hour12: false,
         });
         result.push(formattedTime)

         currentTime.setHours(currentTime.getHours() + step);
     }
     return result;
 }

 function getCookiesStartingWith(prefix) {
     let cookies = document.cookie.split(';');
     let result = [];

     cookies.forEach(function(cookie) {
         cookie = cookie.trim();
         if (cookie.startsWith(prefix)) {
             let cookieNameValue = cookie.split('=');
             let cookieName = cookieNameValue[0];
             let cookieValue = cookieNameValue[1];
             let decodedData = decodeURIComponent(cookieValue);
             let jsonData = JSON.parse(decodedData);

             result.push({ name: cookieName, value: jsonData });
         }
     });

     return result;
 }

 function showPopup() {
     let popupContainer = document.getElementById('popupContainer');
     popupContainer.style.display = 'block';

     setTimeout(function() {
         popupContainer.style.display = 'none';
     }, 1000);
 }

 function selectItemsWithSameTimeAndTitle(data, time, title) {
     return data.filter(item => item.value[1] === time && item.value[3] === title);
 }