const url = "./data/flights.json";

async function getFlightsData(url) {
  const response = await fetch(url);
  let responseData = await response.json();
  responseData = responseData.result.flights;
  console.log(responseData);
  getCarriersRadio(responseData);
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

function getFligthCard() {}

getFlightsData(url);
