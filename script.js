const url = "./data/flights.json";
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
  responseData = responseData.result.flights;
  filterFlights(responseData);
}

function filterFlights(flights) {
  const form = document.forms.form;
  console.log(form.max_price.value);
  const filteredFlights = flights.filter(({ flight }) => {
    if (form.section_1.checked && !form.section_2.checked) {
      return (
        flight.legs[0].segments.length < 2 &&
        flight.price.total.amount >= form.min_price.value &&
        flight.price.total.amount <= form.max_price.value
      );
    } else if (form.section_1.checked && !form.section_2.checked) {
      return (
        flight.legs[0].segments.length > 1 &&
        flight.price.total.amount >= form.min_price.value &&
        flight.price.total.amount <= form.max_price.value
      );
    } else {
      return (
        flight.price.total.amount >= form.min_price.value &&
        flight.price.total.amount <= form.max_price.value
      );
    }
  });
  if (form.sort.value === "price_increase") {
    filteredFlights.sort(
      (a, b) => a.flight.price.total.amount - b.flight.price.total.amount
    );
  } else if (form.sort.value === "price_decrease") {
    filteredFlights.sort(
      (a, b) => b.flight.price.total.amount - a.flight.price.total.amount
    );
  } else {
    filteredFlights.sort(
      (a, b) => a.flight.legs[0].duration - b.flight.legs[0].duration
    );
  }
  getCarriersCheckboxes(filteredFlights);
  // filterFlights = filterFlights.filter(({ flight }) => {});

  console.log(
    Array.from(form.querySelectorAll(".aside-form__checkbox-carriers"))
      .filter((item) => item.firstElementChild.checked)
      .map((item) => item.firstElementChild.name)
  );

  if (filteredFlights.length) getFlightCard(filteredFlights[cardIndex].flight);
}

function getCarriersCheckboxes(flights) {
  const carrierCheckGroup = document.querySelector(
    ".aside-form__item_type_carriers"
  );
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
  let index = 0;
  console.log(carriers);
  for (const carrier in carriers) {
    const carrierCheckEl = document.createElement("div");
    carrierCheckEl.classList.add("aside-form__checkbox-carriers");
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

function getFlightCard(flight) {
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
  const arrivalCity =
    flight.legs[legIndex].segments[flight.legs[legIndex].segments.length - 1]
      .arrivalCity.caption;
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
            class="bigger-text">&rarr;</span></span> ${arrivalCity}, ${arrivalAirport} <span class="blue-text">(${arrivalAirportUid})</span></p>
    </div>
    <div class="main__card-time">
      <p class="main__card-time-departure">${departureDate.getHours()}:${
    (departureDate.getMinutes() < 10 ? "0" : "") + departureDate.getMinutes()
  } <span class="smaller-text blue-text">${departureDate.getDate()} ${
    months[departureDate.getMonth()]
  }. ${weekDays[departureDate.getDay()]}</span></p>
      <p class="main__card-time-travel"><i class="far fa-clock"></i> ${Math.floor(
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
