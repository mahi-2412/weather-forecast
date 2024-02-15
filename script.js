"use strict";

const API_KEY = "4f7e315c3338e28b1c70e1c4c5e0a0be";

const dayEl = document.querySelector(".default_day");
const dateEl = document.querySelector(".default_date");
const btnEl = document.querySelector(".btn_search");
const inputEl = document.querySelector(".input_field");

const iconsContainer = document.querySelector(".icons");
const dayInfoEl = document.querySelector(".day_info");
const listContentEl = document.querySelector(".list_content ul");

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const day = new Date();
const dayName = days[day.getDay()];
dayEl.textContent = dayName;

let month = day.toLocaleString("default", { month: "long" });
let date = day.getDate();
let year = day.getFullYear();

dateEl.textContent = date + " " + month + " " + year;

btnEl.addEventListener("click", async (e) => {
  e.preventDefault();

  if (inputEl.value !== "") {
    const search = inputEl.value;
    inputEl.value = "";
    try {
      await findLocation(search);
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("Please Enter City or Country Name");
  }
});

async function findLocation(name) {
  iconsContainer.innerHTML = "";
  dayInfoEl.innerHTML = "";
  listContentEl.innerHTML = "";

  try {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&APPID=${API_KEY}`;
    const data = await fetch(API_URL);

    if (!data.ok) {
      throw new Error(`Failed to fetch weather data for ${name}`);
    }

    const result = await data.json();

    if (result.cod !== "404") {
      const imageContent = displayImageContent(result);
      const rightSide = rightSideContent(result);
      displayForecast(result.coord.lat, result.coord.lon);

      setTimeout(() => {
        iconsContainer.insertAdjacentHTML("afterbegin", imageContent);
        iconsContainer.classList.add("fadeIn");
        dayInfoEl.insertAdjacentHTML("afterbegin", rightSide);
      }, 1500);
    } else {
      const message = `<h2 class="weather_temp">${result.cod}</h2>
                        <h3 class="cloudtxt">${result.message}</h3>`;
      iconsContainer.insertAdjacentHTML("afterbegin", message);
    }
  } catch (error) {
    console.error(error);
  }
}

function displayImageContent(data) {
  return `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="" />
          <h2 class="weather_temp">${Math.round(data.main.temp - 275.15)}°C</h2>
          <h3 class="cloudtxt">${data.weather[0].description}</h3>`;
}

function rightSideContent(result) {
  return `<div class="content">
            <p class="title">NAME</p>
            <span class="value">${result.name}</span>
          </div>
          <div class="content">
            <p class="title">TEMP</p>
            <span class="value">${Math.round(result.main.temp - 275.15)}°C</span>
          </div>
          <div class="content">
            <p class="title">HUMIDITY</p>
            <span class="value">${result.main.humidity}%</span>
          </div>
          <div class="content">
            <p class="title">WIND SPEED</p>
            <span class="value">${result.wind.speed} Km/h</span>
          </div>`;
}

async function displayForecast(lat, lon) {
  const forecastAPI = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const data = await fetch(forecastAPI);

  if (!data.ok) {
    throw new Error(`Failed to fetch forecast data`);
  }

  const result = await data.json();

  const uniqueForecastDays = [];
  const daysForecast = result.list.filter((forecast) => {
    const forecastDate = new Date(forecast.dt_txt).getDate();
    if (!uniqueForecastDays.includes(forecastDate)) {
      return uniqueForecastDays.push(forecastDate);
    }
  });

  daysForecast.forEach((content, indx) => {
    if (indx <= 3) {
      listContentEl.insertAdjacentHTML("afterbegin", forecast(content));
    }
  });
}

function forecast(frContent) {
  const day = new Date(frContent.dt_txt);
  const dayName = days[day.getDay()];
  const splitDay = dayName.split("", 3);
  const joinDay = splitDay.join("");

  return `<li>
            <img src="https://openweathermap.org/img/wn/${frContent.weather[0].icon}@2x.png" />
            <span>${joinDay}</span>
            <span class="day_temp">${Math.round(frContent.main.temp - 275.15)}°C</span>
          </li>`;
}
