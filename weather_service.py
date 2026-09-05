import httpx


# ---------------------------------------------------------
# GET LOCATION DETAILS
# ---------------------------------------------------------
async def get_location(city):
    url = "https://geocoding-api.open-meteo.com/v1/search"

    params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    response.raise_for_status()

    data = response.json()

    if "results" not in data or not data["results"]:
        raise ValueError("City not found")

    location = data["results"][0]

    return {
        "name": location["name"],
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "country": location.get("country", ""),
        "timezone": location.get("timezone", "auto")
    }


# ---------------------------------------------------------
# GET WEATHER DATA
# ---------------------------------------------------------
async def get_weather(latitude, longitude, timezone="auto"):

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
            "surface_pressure",
            "visibility"
        ]),

        "hourly": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation_probability",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
            "visibility"
        ]),

        "daily": ",".join([
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "apparent_temperature_max",
            "apparent_temperature_min",
            "precipitation_probability_max",
            "precipitation_sum",
            "wind_speed_10m_max",
            "sunrise",
            "sunset"
        ]),

        "timezone": timezone,
        "forecast_days": 7
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    response.raise_for_status()

    return response.json()


# ---------------------------------------------------------
# COMPLETE WEATHER SEARCH
# ---------------------------------------------------------
async def get_complete_weather(city):

    location = await get_location(city)

    weather = await get_weather(
        location["latitude"],
        location["longitude"],
        location["timezone"]
    )

    return {
        "location": location,
        "weather": weather
    }