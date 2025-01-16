import pandas as pd
import csv

def fill_with_zero(df):
    """
    Fill missing dates with zeros
    """
    # Fill from first Sunday till yesterday
    idx = pd.date_range('01-29-2024', pd.to_datetime('today').normalize() - pd.Timedelta(days=1))


    df.index = pd.DatetimeIndex(df.index)
    df = df.reindex(idx, fill_value=0)

    return df

def number_of_items():
    """
    Gives number of items lost every day from the begining till today
    """
    # Read the data (new and old)
    df = pd.read_csv("lost_and_found.csv")
    # df = df.drop_duplicates(subset=['Dzień Znalezienia', 'Numer Pociągu', 'Relacja Pociągu', 'Stacja Znalezienia', 'Rodzaj Rzeczy'])

    # Correctly read the dates
    df["Dzień Znalezienia"] = pd.to_datetime(df["Dzień Znalezienia"], format="%Y-%m-%d")

    # Group items by day
    counts = df.groupby("Dzień Znalezienia").count()["Rodzaj Rzeczy"]
    counts = fill_with_zero(counts)

    dates, values = counts.index, counts.values
    
    

    # Open the CSV file in write mode
    with open('lost_items.csv', 'w', newline='') as csvfile:
        # Create a CSV writer object
        csvwriter = csv.writer(csvfile)

        # Write the header (optional)
        csvwriter.writerow(['date', 'value'])

        # Write each pair from the two lists as a row
        for i in range(len(dates)):
            csvwriter.writerow([dates[i], values[i]])


if __name__ == "__main__":
    number_of_items()
