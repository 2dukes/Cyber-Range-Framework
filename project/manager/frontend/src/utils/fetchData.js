const fetchScenarios = async (solved) => {
    const data = { solved };
    const queryParams = Object.keys(data)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
        .join('&');

    const scenarioResult = await fetch("http://localhost:8000/scenarios?" + queryParams);
    const scenarioResultJSON = await scenarioResult.json();

    return {
        scenarios: scenarioResultJSON.scenarios
    };
};

export default fetchScenarios;