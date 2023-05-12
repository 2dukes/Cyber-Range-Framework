const fetchScenarios = async (solved) => {
    const data = { solved };
    const queryParams = Object.keys(data)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
        .join('&');

    const scenarioResult = await fetch(`http://${process.env.REACT_APP_MACHINE_HOSTNAME}:8000/scenarios?` + queryParams);
    const scenarioResultJSON = await scenarioResult.json();

    return {
        scenarios: scenarioResultJSON.scenarios
    };
};

export { fetchScenarios };