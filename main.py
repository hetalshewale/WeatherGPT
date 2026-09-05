from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from weather_service import get_location, get_weather
from decision_engine import (
    calculate_risk,
    generate_advice,
    weather_description
)
from chat_engine import (
    detect_activity,
    create_chat_response
)


# ---------------------------------------------------------
# CREATE FASTAPI APP
# ---------------------------------------------------------

app = FastAPI(
    title="WeatherGPT",
    description="AI-Powered Weather Decision Assistant",
    version="1.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ---------------------------------------------------------
# HOME
# ---------------------------------------------------------

@app.get("/")
def home():

    return {
        "project": "WeatherGPT",
        "message": "AI-Powered Weather Decision Assistant",
        "status": "Backend is running"
    }


# ---------------------------------------------------------
# LOCATION API
# ---------------------------------------------------------

@app.get("/api/location")
async def location(city: str):

    try:

        return await get_location(city)

    except Exception as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ---------------------------------------------------------
# WEATHER API
# ---------------------------------------------------------

@app.get("/api/weather")
async def weather(city: str):

    try:

        location_data = await get_location(city)

        weather_data = await get_weather(
            location_data["latitude"],
            location_data["longitude"],
            location_data["timezone"]
        )

        current = weather_data["current"]

        return {

            "location": location_data["name"],

            "country": location_data["country"],

            "temperature": current["temperature_2m"],

            "feels_like": current["apparent_temperature"],

            "humidity": current["relative_humidity_2m"],

            "wind_speed": current["wind_speed_10m"],

            "pressure": current["surface_pressure"],

            "visibility": current["visibility"],

            "rain": current["precipitation"],

            "weather_code": current["weather_code"],

            "condition": weather_description(
                current["weather_code"]
            )

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------------------------------------------------
# HOURLY FORECAST
# ---------------------------------------------------------

@app.get("/api/hourly")
async def hourly(city: str):

    try:

        location_data = await get_location(city)

        weather_data = await get_weather(
            location_data["latitude"],
            location_data["longitude"],
            location_data["timezone"]
        )

        return {
            "location": location_data["name"],
            "hourly": weather_data["hourly"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------------------------------------------------
# 7 DAY FORECAST
# ---------------------------------------------------------

@app.get("/api/forecast")
async def forecast(city: str):

    try:

        location_data = await get_location(city)

        weather_data = await get_weather(
            location_data["latitude"],
            location_data["longitude"],
            location_data["timezone"]
        )

        return {
            "location": location_data["name"],
            "daily": weather_data["daily"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------------------------------------------------
# WEATHER DECISION ANALYSIS
# ---------------------------------------------------------

@app.get("/api/analyze")
async def analyze(
    city: str,
    activity: str
):

    try:

        location_data = await get_location(city)

        weather_data = await get_weather(
            location_data["latitude"],
            location_data["longitude"],
            location_data["timezone"]
        )

        current = weather_data["current"]

        rain_probability = max(
            weather_data["hourly"]
            ["precipitation_probability"][:12]
        )

        result = calculate_risk(

            temperature=current["temperature_2m"],

            rain_probability=rain_probability,

            wind_speed=current["wind_speed_10m"],

            humidity=current["relative_humidity_2m"],

            visibility=current["visibility"],

            activity=activity
        )

        advice = generate_advice(

            temperature=current["temperature_2m"],

            rain_probability=rain_probability,

            wind_speed=current["wind_speed_10m"],

            humidity=current["relative_humidity_2m"],

            activity=activity
        )

        return {

            "location": location_data["name"],

            "activity": activity,

            "temperature":
                current["temperature_2m"],

            "feels_like":
                current["apparent_temperature"],

            "humidity":
                current["relative_humidity_2m"],

            "wind_speed":
                current["wind_speed_10m"],

            "rain_probability":
                rain_probability,

            "risk_score":
                result["risk_score"],

            "risk_level":
                result["risk_level"],

            "recommendation":
                result["recommendation"],

            "reasons":
                result["reasons"],

            "advice":
                advice

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------------------------------------------------
# WEATHER CHAT
# ---------------------------------------------------------

@app.get("/api/chat")
async def chat(
    city: str,
    question: str
):

    try:

        location_data = await get_location(city)

        weather_data = await get_weather(

            location_data["latitude"],

            location_data["longitude"],

            location_data["timezone"]

        )

        activity = detect_activity(question)

        response = create_chat_response(

            question,

            weather_data,

            activity

        )

        return {

            "city": location_data["name"],

            "question": question,

            "detected_activity": activity,

            "answer": response

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )