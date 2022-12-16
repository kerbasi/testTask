async function getFlightsData() {
  const carrierCheckGroup = document.querySelector(
    ".aside-form__item_type_carriers"
  );
  const carriers = {};
  const url = "./flights.json";
  const response = await fetch(url);
  let responseData = await response.json();
  responseData = responseData.result.flights;
  responseData.forEach(({ flight }) => {
    carriers[flight.carrier.uid] = flight.carrier.caption;
  });

  let index = 0;
  for (const carrier in carriers) {
    const carrierCheckEl = document.createElement("div");
    carrierCheckEl.classList.add("aside-form__checkbox");
    carrierCheckEl.innerHTML = `
        <input class="aside-form__checkbox" type="checkbox" name="aside-form__radio-carrier" id="check-carrier_${index}">
        <label class="aside-form__label-inline" for="check_1">${carriers[carrier]}</label>
    `;
    carrierCheckGroup.appendChild(carrierCheckEl);
    index++;
  }
}

getFlightsData();
