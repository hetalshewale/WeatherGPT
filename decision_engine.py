# ---------------------------------------------------------
# WEATHER DESCRIPTION
# ---------------------------------------------------------

def weather_description(code):

    descriptions = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Heavy Drizzle",
        61: "Light Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Light Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        80: "Rain Showers",
        81: "Moderate Rain Showers",
        82: "Heavy Rain Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Heavy Thunderstorm"
    }

    return descriptions.get(code, "Unknown Weather")


# ---------------------------------------------------------
# CALCULATE WEATHER RISK
# ---------------------------------------------------------

def calculate_risk(
    temperature,
    rain_probability,
    wind_speed,
    humidity,
    visibility,
    activity
):

    score = 0
    reasons = []

    # -------------------------
    # RAIN
    # -------------------------

    if rain_probability >= 70:
        score += 30
        reasons.append(
            f"High rain probability ({rain_probability}%)"
        )

    elif rain_probability >= 40:
        score += 15
        reasons.append(
            f"Moderate rain probability ({rain_probability}%)"
        )

    # -------------------------
    # WIND
    # -------------------------

    if wind_speed >= 30:
        score += 25
        reasons.append(
            f"Strong wind ({wind_speed} km/h)"
        )

    elif wind_speed >= 20:
        score += 15
        reasons.append(
            f"High wind speed ({wind_speed} km/h)"
        )

    # -------------------------
    # TEMPERATURE
    # -------------------------

    if temperature >= 38:
        score += 20
        reasons.append(
            f"Very high temperature ({temperature}°C)"
        )

    elif temperature >= 34:
        score += 10
        reasons.append(
            f"High temperature ({temperature}°C)"
        )

    elif temperature <= 10:
        score += 10
        reasons.append(
            f"Low temperature ({temperature}°C)"
        )

    # -------------------------
    # HUMIDITY
    # -------------------------

    if humidity >= 80:
        score += 10
        reasons.append(
            f"High humidity ({humidity}%)"
        )

    # -------------------------
    # VISIBILITY
    # -------------------------

    if visibility < 5000:
        score += 15
        reasons.append(
            "Low visibility"
        )

    # -------------------------
    # ACTIVITY SPECIFIC RULES
    # -------------------------

    activity = activity.lower()

    if activity in ["running", "cycling", "hiking", "outdoor activity"]:

        if temperature >= 32:
            score += 10
            reasons.append(
                "Temperature may be uncomfortable for outdoor activity"
            )

        if rain_probability >= 60:
            score += 10
            reasons.append(
                "Rain may affect the outdoor activity"
            )

    elif activity == "cricket":

        if rain_probability >= 50:
            score += 15
            reasons.append(
                "Rain can interrupt cricket"
            )

        if wind_speed >= 25:
            score += 10
            reasons.append(
                "Strong wind can affect cricket"
            )

    elif activity == "event":

        if rain_probability >= 50:
            score += 20
            reasons.append(
                "Rain may affect the event"
            )

    elif activity == "travel":

        if visibility < 5000:
            score += 15
            reasons.append(
                "Low visibility may affect travel"
            )

        if wind_speed >= 30:
            score += 15
            reasons.append(
                "Strong wind may affect travel"
            )

    # -------------------------
    # LIMIT SCORE
    # -------------------------

    score = min(score, 100)

    # -------------------------
    # RISK LEVEL
    # -------------------------

    if score >= 70:

        risk_level = "HIGH"
        recommendation = "Not Recommended"

    elif score >= 40:

        risk_level = "MEDIUM"
        recommendation = "Use Caution"

    else:

        risk_level = "LOW"
        recommendation = "Recommended"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "reasons": reasons
    }


# ---------------------------------------------------------
# GENERATE PERSONALIZED ADVICE
# ---------------------------------------------------------

def generate_advice(
    temperature,
    rain_probability,
    wind_speed,
    humidity,
    activity
):

    advice = []

    activity = activity.lower()

    if rain_probability >= 50:

        advice.append(
            "Carry an umbrella or rain jacket."
        )

    if rain_probability >= 70:

        advice.append(
            "Consider rescheduling the activity."
        )

    if wind_speed >= 25:

        advice.append(
            "Avoid exposed or open areas."
        )

    if temperature >= 34:

        advice.append(
            "Stay hydrated and avoid prolonged outdoor exposure."
        )

    if humidity >= 80:

        advice.append(
            "High humidity may make outdoor activity uncomfortable."
        )

    if activity == "cricket":

        if rain_probability >= 50:
            advice.append(
                "Keep an indoor backup plan for cricket."
            )

    elif activity == "travel":

        advice.append(
            "Check road and travel conditions before leaving."
        )

    elif activity in [
        "running",
        "cycling",
        "hiking",
        "outdoor activity"
    ]:

        if temperature >= 32:
            advice.append(
                "Consider choosing a cooler time of day."
            )

    if not advice:

        advice.append(
            "Weather conditions look suitable for your activity."
        )

    return advice