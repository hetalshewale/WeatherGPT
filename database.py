import mysql.connector


def get_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Root@1234",
        database="weathergpt"
    )

    return connection


def test_database():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("SELECT DATABASE()")

    result = cursor.fetchone()

    print("Connected to database:", result[0])

    cursor.close()
    connection.close()


def save_plan(
    city,
    activity,
    temperature,
    humidity,
    wind_speed,
    rain_probability,
    risk_score,
    risk_level,
    recommendation
):

    connection = get_connection()

    cursor = connection.cursor()

    query = """
    INSERT INTO plans
    (
        city,
        activity,
        temperature,
        humidity,
        wind_speed,
        rain_probability,
        risk_score,
        risk_level,
        recommendation
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        city,
        activity,
        temperature,
        humidity,
        wind_speed,
        rain_probability,
        risk_score,
        risk_level,
        recommendation
    )

    cursor.execute(query, values)

    connection.commit()

    cursor.close()
    connection.close()

    print("Plan saved successfully!")


if __name__ == "__main__":
    test_database()