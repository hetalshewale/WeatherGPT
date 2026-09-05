# ---------------------------------------------------------
# DETECT ACTIVITY
# ---------------------------------------------------------

def detect_activity(question):

    question = question.lower()

    if "cricket" in question:
        return "cricket"

    if "football" in question:
        return "football"

    if "running" in question or "run" in question:
        return "running"

    if "cycling" in question or "cycle" in question:
        return "cycling"

    if "hiking" in question or "hike" in question:
        return "hiking"

    if "event" in question or "function" in question:
        return "event"

    if "travel" in question or "trip" in question:
        return "travel"

    return "general"


# ---------------------------------------------------------
# DETECT QUESTION INTENT
# ---------------------------------------------------------

def detect_intent(question):

    question = question.lower()

    if "umbrella" in question:
        return "umbrella"

    if "rain" in question or "raining" in question:
        return "rain"

    if "safe" in question or "danger" in question:
        return "safety"

    if "best time" in question or "better time" in question:
        return "best_time"

    if "weather" in question:
        return "weather"

    return "general"


# ---------------------------------------------------------
# CREATE CHAT RESPONSE
# ---------------------------------------------------------

def create_chat_response(question, weather_data, activity=None):

    question_lower = question.lower()

    current = weather_data["current"]

    temperature = current["temperature_2m"]

    humidity = current["relative_humidity_2m"]

    rain_probability = max(
        weather_data["hourly"]["precipitation_probability"][:12]
    )

    wind_speed = current["wind_speed_10m"]

    # -----------------------------------------
    # UMBRELLA
    # -----------------------------------------

    if "umbrella" in question_lower:

        if rain_probability >= 50:

            return (
                f"Yes, I recommend carrying an umbrella. "
                f"There is a rain probability of about "
                f"{rain_probability}% in the upcoming hours."
            )

        else:

            return (
                f"You probably don't need an umbrella. "
                f"The rain probability is only about "
                f"{rain_probability}%."
            )

    # -----------------------------------------
    # RAIN
    # -----------------------------------------

    if "rain" in question_lower:

        if rain_probability >= 60:

            return (
                f"Rain is quite possible. "
                f"The maximum rain probability in the "
                f"upcoming hours is {rain_probability}%."
            )

        elif rain_probability >= 30:

            return (
                f"There is a moderate chance of rain, "
                f"around {rain_probability}%."
            )

        else:

            return (
                f"The chance of rain looks low, "
                f"around {rain_probability}%."
            )

    # -----------------------------------------
    # SAFETY
    # -----------------------------------------

    if "safe" in question_lower:

        if rain_probability >= 70 or wind_speed >= 30:

            return (
                "Weather conditions may create some risk. "
                f"Rain probability is {rain_probability}% "
                f"and wind speed is {wind_speed} km/h. "
                "Consider postponing outdoor plans."
            )

        else:

            return (
                "Current weather conditions look reasonably "
                "safe for normal outdoor activities."
            )

    # -----------------------------------------
    # GENERAL WEATHER
    # -----------------------------------------

    return (
        f"The current temperature is {temperature}°C, "
        f"humidity is {humidity}%, and wind speed is "
        f"{wind_speed} km/h. "
        f"The upcoming rain probability is about "
        f"{rain_probability}%."
    )