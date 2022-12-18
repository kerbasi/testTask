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

async function getFlightsData(url) {
  const response = await fetch(url);
  let responseData = await response.json();
  responseData = responseData.result.flights;
  console.log(responseData);
  getCarriersRadio(responseData);
  getFlightCard(responseData[5].flight);
}

function getCarriersRadio(flights) {
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
  console.log(carriers);
  let index = 0;
  for (const carrier in carriers) {
    const carrierCheckEl = document.createElement("div");
    carrierCheckEl.classList.add("aside-form__checkbox-carriers");
    carrierCheckEl.innerHTML = `
        <input class="aside-form__checkbox" type="checkbox" name="aside-form__radio-carrier" id="check-carrier_${index}">
        <label class="aside-form__label-inline" for="check_1"><span class="aside__carrier-name">${
          carriers[carrier].caption
        }</span> от ${
      carriers[carrier].price.sort((a, b) => a - b)[0]
    } р.</label>
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
  let departureDate = flight.legs[legIndex].segments[0].departureDate;
  let departureTime = departureDate.slice(departureDate.indexOf("T") + 1, -3);
  let arrivalDate =
    flight.legs[legIndex].segments[flight.legs[legIndex].segments.length - 1]
      .arrivalDate;
  let arrivalTime = arrivalDate.slice(arrivalDate.indexOf("T") + 1, -3);
  const duration = flight.legs[legIndex].duration;
  const legCarrier = flight.legs[legIndex].segments[0].airline.caption;
  console.log(departureTime, arrivalTime);
  cardOneWay.classList.add("main__card-one-way");
  cardOneWay.innerHTML = `
  <section class="main__card-one-way">
    <div class="main__card-leg">
      <p class="main__card-leg-text">${departureCity}, ${departureAirport} <span class="blue-text">(${departureAirportUid}) <span
            class="bigger-text">&rarr;</span></span> ${arrivalCity}, ${arrivalAirport} <span class="blue-text">(${arrivalAirportUid})</span></p>
    </div>
    <div class="main__card-time">
      <p class="main__card-time-departure">${departureTime} <span class="smaller-text blue-text">18 авг. вт</span></p>
      <p class="main__card-time-travel"><i class="far fa-clock"></i> ${Math.floor(
        duration / 60
      )} ч ${duration % 60} мин</p>
      <p class="main__card-time-arrival"><span class="smaller-text blue-text">19 авг. ср</span> ${arrivalTime}</p>
    </div>
    <div class="main__card-segments">
      <div class="main__card-segments-line"></div>
      ${
        flight.legs[legIndex].segments.length > 1
          ? `<div class="main__card-segments-number">1 пересадка</div>`
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
/* <article class="main__card">
<section class="main__card-header">
  <img class="main__card-logo" src="./images/turk-hava.png" alt="аэрофлот лого">
  <div class="main__card-price">
    <p class="main__card-price-value">21049 &#8381;</p>
    <p class="main__card-price-sub">Стоимость для одного взрослого пассажира</p>
  </div>
</section>
<section class="main__card-one-way">
  <div class="main__card-leg">
    <p class="main__card-leg-text">Москва, ШЕРЕМЕТЬЕВО <span class="blue-text">(SVO) <span
          class="bigger-text">&rarr;</span></span> ЛОНДОН, Лондон,
      Хитроу <span class="blue-text">(LHR)</span></p>
  </div>
  <div class="main__card-time">
    <p class="main__card-time-departure">20:40 <span class="smaller-text blue-text">18 авг. вт</span></p>
    <p class="main__card-time-travel"><i class="far fa-clock"></i> 14 ч 45 мин</p>
    <p class="main__card-time-arrival"><span class="smaller-text blue-text">19 авг. ср</span> 09:25</p>
  </div>
  <div class="main__card-segments">
    <div class="main__card-segments-line"></div>
    <div class="main__card-segments-number">1 пересадка</div>
    <div class="main__card-segments-line"></div>
  </div>
  <div class="main__card-carrier">
    <p class="main__card-carrier-text">
      Рейс выполняет: Аэрофлот - российский авиалинии
    </p>
  </div>
</section>
<div class="main__card-divider"></div>
<section class="main__card-one-way">
  <div class="main__card-leg">
    <p class="main__card-leg-text">Москва, ШЕРЕМЕТЬЕВО <span class="blue-text">(SVO) <span
          class="bigger-text">&rarr;</span></span> ЛОНДОН, Лондон,
      Хитроу <span class="blue-text">(LHR)</span></p>
  </div>
  <div class="main__card-time">
    <p class="main__card-time-departure">20:40 <span class="smaller-text blue-text">18 авг. вт</span></p>
    <p class="main__card-time-travel"><i class="far fa-clock"></i> 14 ч 45 мин</p>
    <p class="main__card-time-arrival"><span class="smaller-text blue-text">19 авг. ср</span> 09:25</p>
  </div>
  <div class="main__card-segments">
    <div class="main__card-segments-line"></div>
    <div class="main__card-segments-number">1 пересадка</div>
    <div class="main__card-segments-line"></div>
  </div>
  <div class="main__card-carrier">
    <p class="main__card-carrier-text">
      Рейс выполняет: Аэрофлот - российский авиалинии
    </p>
  </div>
</section>
<button class="main__card-button">
  ВЫБРАТЬ
</button>
</article> */
