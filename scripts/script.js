const url = "./data/flights.json";

let data = [];

const carriersLogos = {
  AF: "./images/air-france.png",
  AY: "./images/Finnair.png",
  AZ: "./images/alitalia.png",
  BT: "./images/air-baltic.png",
  KL: "./images/klm.png",
  LO: "./images/lot.png",
  PC: "./images/pegasus.png",
  SN: "./images/brussels.png",
  SU1: "./images/aeroflot.png",
  TK: "./images/turk-hava.png",
};

const months = [
  "янв.",
  "фев.",
  "март",
  "апр.",
  "май",
  "июнь",
  "июль",
  "авг.",
  "сент.",
  "окт.",
  "ноя.",
  "дек.",
];

const weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

let cardIndex = 0;

async function getFlightsData(url) {
  const response = await fetch(url);
  let responseData = await response.json();

  const form = document.forms.form;
  const popup = document.querySelector(".popup");
  data = responseData.result.flights;
  setPricesLimits(data);
  form.section_1.checked = false;
  Array.from(form).forEach((item) =>
    item.addEventListener("change", () => {
      clearCards();
      cardIndex = 0;
      renderCarriersCheck(data);
      renderCard(data);
    })
  );
  document.querySelector(".main__button").addEventListener("click", () => {
    addCard(data);
  });
  form.section_2.checked = false;
  renderCarriersCheck(data);
  renderCard(data);
  popup.classList.add("disable");
}

function renderCarriersCheck(flights) {
  let filteredFlights = filterFlights(flights);
  if (filteredFlights.length) {
    getCarriersCheckboxes(filteredFlights);
  }
}

function renderCard(flights) {
  let filteredFlights = filterFlights(flights);
  filteredFlights = filterByCarriers(filteredFlights);
  console.log(cardIndex);
  if (filteredFlights.length) {
    sortFlights(filteredFlights);
    getFlightCard(filteredFlights);
    cardIndex++;
    if (filteredFlights.length > cardIndex) {
      document.querySelector(".main__button").classList.add("disable");
    }
    document.querySelector(".main__button").classList.remove("disable");
  } else if (filteredFlights.length === 0) {
    getMainMessage("Нет подходящих полетов");
    document.querySelector(".main__button").classList.add("disable");
  }
}

function getMainMessage(text) {
  const main = document.querySelector(".main__cards");
  main.innerHTML = `<p class="main__message">${text}</p>`;
}

function filterFlights(flights) {
  const form = document.forms.form;
  const filteredFlights = flights.filter(({ flight }) => {
    if (form.section_1.checked && !form.section_2.checked) {
      return (
        flight.legs[0].segments.length < 2 &&
        parseInt(flight.price.total.amount) >= parseInt(form.min_price.value) &&
        parseInt(flight.price.total.amount) <= parseInt(form.max_price.value)
      );
    } else if (form.section_1.checked && !form.section_2.checked) {
      return (
        flight.legs[0].segments.length > 1 &&
        parseInt(flight.price.total.amount) >= parseInt(form.min_price.value) &&
        parseInt(flight.price.total.amount) <= parseInt(form.max_price.value)
      );
    } else {
      let answer =
        parseInt(flight.price.total.amount) >= parseInt(form.min_price.value) &&
        parseInt(flight.price.total.amount) <= parseInt(form.max_price.value);
      return answer;
    }
  });
  return filteredFlights;
}

function sortFlights(flights) {
  if (form.sort.value === "price_increase") {
    flights.sort(
      (a, b) => a.flight.price.total.amount - b.flight.price.total.amount
    );
  } else if (form.sort.value === "price_decrease") {
    flights.sort(
      (a, b) => b.flight.price.total.amount - a.flight.price.total.amount
    );
  } else {
    flights.sort(
      (a, b) => a.flight.legs[0].duration - b.flight.legs[0].duration
    );
  }
}

function addCard(flights) {
  renderCard(data);
}

function filterByCarriers(flights) {
  const form = document.forms.form;
  const checkedCarriers = Array.from(
    form.querySelectorAll(".aside-form__checkbox-carriers")
  )
    .filter((item) => item.firstElementChild.checked)
    .map((item) => item.firstElementChild.name);
  const filteredFlights = flights.filter(({ flight }) =>
    checkedCarriers.includes(flight.carrier.uid)
  );
  return filteredFlights;
}

function getCarriers(flights) {
  const carriers = {};
  flights.forEach(({ flight }) => {
    if (carriers.hasOwnProperty(flight.carrier.uid)) {
      carriers[flight.carrier.uid].price.push(flight.price.total.amount);
    } else {
      carriers[flight.carrier.uid] = {
        caption: flight.carrier.caption,
        price: [flight.price.total.amount],
      };
    }
  });
  return carriers;
}

function setPricesLimits(flights) {
  const carriers = getCarriers(flights);
  const minPriceEl = document.forms.form.min_price;
  const maxPriceEl = document.forms.form.max_price;
  let minPriceForAll = carriers[Object.keys(carriers)[0]].price.sort(
    (a, b) => parseInt(a) - parseInt(b)
  )[0];
  let maxPriceForAll = carriers[Object.keys(carriers)[0]].price.sort(
    (a, b) => parseInt(b) - parseInt(a)
  )[0];

  for (const carrier in carriers) {
    let minPrice = carriers[carrier].price.sort(
      (a, b) => parseInt(a) - parseInt(b)
    )[0];
    let maxPrice = carriers[carrier].price.sort(
      (a, b) => parseInt(b) - parseInt(a)
    )[0];
    if (parseInt(minPriceForAll) > parseInt(minPrice)) {
      minPriceForAll = minPrice;
    }
    if (parseInt(maxPriceForAll) < parseInt(maxPrice)) {
      maxPriceForAll = maxPrice;
    }
  }
  minPriceEl.min = minPriceForAll;
  minPriceEl.value = minPriceForAll;
  maxPriceEl.max = maxPriceForAll;
  maxPriceEl.value = maxPriceForAll;
}

function clearCards() {
  const main = document.querySelector(".main__cards");
  main.innerHTML = "";
}

function getCarriersCheckboxes(flights) {
  const carriers = getCarriers(flights);
  let index = 0;
  if (Object.keys(carriers).length > 0) {
    const carrierCheckGroup = document.querySelector(
      ".aside-form__item_type_carriers"
    );
    carrierCheckGroup.innerHTML = "";
    for (const carrier in carriers) {
      const carrierCheckEl = document.createElement("div");
      carrierCheckEl.classList.add("aside-form__checkbox-carriers");
      carrierCheckEl.addEventListener("change", () => {
        cardIndex = 0;
        clearCards();
        renderCard(data);
      });
      carrierCheckEl.innerHTML = `
        <input class="aside-form__checkbox" checked type="checkbox" name="${carrier}" id="check-carrier_${index}">
        <label class="aside-form__label-inline" for="check-carrier_${index}"><span class="aside__carrier-name">${
        carriers[carrier].caption
      }</span> от ${carriers[carrier].price.sort((a, b) => a - b)[0]} р.</label>
    `;
      carrierCheckGroup.appendChild(carrierCheckEl);
      index++;
    }
  }
}

function getFlightCard(flights) {
  console.log(flights);
  const flight = flights[cardIndex].flight;
  console.log(flight);
  const main = document.querySelector(".main__cards");
  const card = document.createElement("article");
  const divider = document.createElement("div");
  divider.classList.add("main__card-divider");
  card.classList.add("main__card");
  card.appendChild(getCardHeader(flight));
  card.appendChild(getCardOneWay(flight, "forward"));
  card.appendChild(divider);
  card.appendChild(getCardOneWay(flight, "backward"));
  card.appendChild(getCardButton(flight));
  main.appendChild(card);
  card.scrollIntoView({ behavior: "smooth" });
}

function getCardHeader(flight) {
  const cardHeaderEl = document.createElement("section");
  const logoPath = carriersLogos[flight.carrier.uid];
  const price = flight.price.total.amount;
  cardHeaderEl.classList.add("main__card-header");
  cardHeaderEl.innerHTML = `
  <img class="main__card-logo" src=${logoPath} alt="лого компании">
  <div class="main__card-price">
    <p class="main__card-price-value">${price} &#8381;</p>
    <p class="main__card-price-sub">Стоимость для одного взрослого пассажира</p>
  </div>
  `;
  return cardHeaderEl;
}

function getCardOneWay(flight, direction = "forward") {
  const cardOneWay = document.createElement("section");
  let legIndex;
  if (direction === "forward") {
    legIndex = 0;
  } else if (direction === "backward") {
    legIndex = 1;
  }

  const departureCity = flight.legs[legIndex].segments[0].departureCity.caption;
  const departureAirport =
    flight.legs[legIndex].segments[0].departureAirport.caption;
  const departureAirportUid =
    flight.legs[legIndex].segments[0].departureAirport.uid;
  const arrivalCity = flight.legs[legIndex].segments[
    flight.legs[legIndex].segments.length - 1
  ].hasOwnProperty("arrivalCity")
    ? flight.legs[legIndex].segments[flight.legs[legIndex].segments.length - 1]
        .arrivalCity.caption
    : "--";
  const arrivalAirport =
    flight.legs[legIndex].segments[flight.legs[legIndex].segments.length - 1]
      .arrivalAirport.caption;
  const arrivalAirportUid =
    flight.legs[legIndex].segments[flight.legs[legIndex].segments.length - 1]
      .arrivalAirport.uid;
  let departureDate = new Date(flight.legs[legIndex].segments[0].departureDate);

  let arrivalDate = new Date(
    flight.legs[legIndex].segments[
      flight.legs[legIndex].segments.length - 1
    ].arrivalDate
  );
  const duration = flight.legs[legIndex].duration;
  const legCarrier = flight.legs[legIndex].segments[0].airline.caption;

  cardOneWay.classList.add("main__card-one-way");
  cardOneWay.innerHTML = `
  <section class="main__card-one-way">
    <div class="main__card-leg">
      <p class="main__card-leg-text">${departureCity}, ${departureAirport} <span class="blue-text">(${departureAirportUid}) <span
            class="bigger-text">&rarr;</span></span> ${arrivalCity},&nbsp;${arrivalAirport.replace(
    " ",
    "&nbsp;"
  )}&nbsp;<span class="blue-text">(${arrivalAirportUid})</span></p>
    </div>
    <div class="main__card-time">
      <p class="main__card-time-departure">${departureDate.getHours()}:${
    (departureDate.getMinutes() < 10 ? "0" : "") + departureDate.getMinutes()
  } <span class="smaller-text blue-text">${departureDate.getDate()} ${
    months[departureDate.getMonth()]
  }. ${weekDays[departureDate.getDay()]}</span></p>
      <p class="main__card-time-travel"><span class="smaller-text"><i class="far fa-clock"></span></i> ${Math.floor(
        duration / 60
      )} ч ${duration % 60} мин</p>
      <p class="main__card-time-arrival"><span class="smaller-text blue-text">${arrivalDate.getDate()} ${
    months[arrivalDate.getMonth()]
  }. ${weekDays[arrivalDate.getDay()]}</span> ${arrivalDate.getHours()}:${
    (arrivalDate.getMinutes() < 10 ? "0" : "") + arrivalDate.getMinutes()
  }</p>
    </div>
    <div class="main__card-segments">
      <div class="main__card-segments-line"></div>
      ${
        flight.legs[legIndex].segments.length === 2
          ? `<div class="main__card-segments-number">1 пересадка</div>`
          : flight.legs[legIndex].segments.length > 2
          ? `<div class="main__card-segments-number">${
              flight.legs[legIndex].segments.length - 1
            } пересадок</div>`
          : ``
      }
      <div class="main__card-segments-line"></div>
    </div>
    <div class="main__card-carrier">
      <p class="main__card-carrier-text">
        Рейс выполняет: ${legCarrier}
      </p>
    </div>
  </section>
  `;
  return cardOneWay;
}

function getCardButton(flight) {
  const cardButton = document.createElement("button");
  cardButton.classList.add("main__card-button");
  cardButton.innerHTML = "ВЫБРАТЬ";
  return cardButton;
}

getFlightsData(url);
