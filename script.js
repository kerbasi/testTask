fetch("./flights.json")
  .then((res) => res.json())
  .then((flights) => {
    console.log(flights.result);
  });
