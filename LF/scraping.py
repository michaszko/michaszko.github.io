import pandas as pd
import requests
import json
from bs4 import BeautifulSoup
import time
import random


def scraping():
    """
    Scrap the new data from the website.
    By new I mean just one day (~10 pages)
    """
    # We assume that there will be no more than 20 pages of items a day
    N = 20

    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    }

    url_template = "https://www.intercity.pl/pl/site/dla-pasazera/obsluga-klientow/odbior-zagubionego-bagazu.html?page={}"

    for i in range(1, N):
        # URL of the website you want to scrape (replace with the actual URL)
        url = url_template.format(i)
        time.sleep(random.uniform(1, 5))  # Random delay

        response = requests.get(url, headers=headers)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the HTML content using BeautifulSoup
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find the table by its class name (replace the class name if different)
            table = soup.find('div', class_='table-responsive').find('table', class_='table')

            # Extract headers
            headers = [header.text for header in table.find('thead').find_all('th')]

            # Extract table rows
            rows = table.find('tbody').find_all('tr')
            table_data = []

            # Loop through rows and extract each cell's text
            for row in rows:
                cells = row.find_all('td')
                row_data = [cell.text.strip() for cell in cells]  # Strip any extra whitespace
                table_data.append(row_data)

            if i == 1:
                # Create a DataFrame from the extracted data
                df = pd.DataFrame(table_data, columns=headers)
            else:
                df = pd.concat([df, pd.DataFrame(table_data, columns=headers)], axis=0, ignore_index=True)
        else:
            print(f"Failed to retrieve the webpage. Status code: {response.status_code}")

    # Save a copy
    df.to_csv("tmp.csv")

    # Read the data (new and old)
    df_old = pd.read_csv("lost_and_found.csv")
    df_new = pd.read_csv("tmp.csv")

    # Combine both datasets and remove dups
    df_all = pd.concat([df_new, df_old])
    # Leave only important columns
    df_all = df_all.filter(['Dzień Znalezienia', 'Numer Pociągu', 'Relacja Pociągu', 'Stacja Znalezienia', 'Rodzaj Rzeczy'])

    # Correct the data - spelling, capital letters etc.
    corrections = json.load(open("./corrections.txt"))

    df_all["Stacja Znalezienia"] = df_all["Stacja Znalezienia"].str.title()
    df_all["Stacja Znalezienia"] = df_all["Stacja Znalezienia"].replace(corrections)

    df_all["Rodzaj Rzeczy"] = df_all["Rodzaj Rzeczy"].str.title()

    df_all["Relacja Pociągu"] = df_all["Relacja Pociągu"].str.title()

    # Remove the duplicates
    # df_all = df_all.drop_duplicates(subset=['Dzień Znalezienia', 'Numer Pociągu', 'Relacja Pociągu', 'Stacja Znalezienia', 'Rodzaj Rzeczy'])
    df_all = df_all.drop_duplicates()

    # Save as current new "old data"
    df_all.to_csv("lost_and_found.csv")


if __name__ == "__main__":
    scraping()
