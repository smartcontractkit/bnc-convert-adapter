# Chainlink External Adapter for BNC RapidAPI convert endpoint

## Input Params

- `base`, `from`, or `coin`: The symbol of the currency to query
- `quote`, `to`, or `market`: The symbol of the currency to convert to

## Output

```json
{
 "jobRunID": "1",
 "data": {
  "success": true,
  "source": "BraveNewCoin",
  "request_date": "2020-04-13 19:23:15",
  "from_quantity": "1",
  "from_symbol": "ETH",
  "from_name": "Ethereum",
  "to_symbol": "USD",
  "to_name": "United States Dollar",
  "to_quantity": 154.5907109,
  "result": 154.5907109
 },
 "result": 154.5907109,
 "statusCode": 200
}
```

## Install

```bash
yarn install
```

## Test

```bash
yarn test
```

## Create the zip

```bash
zip -r cl-bnc-convert.zip .
```

## Docker

If you wish to use Docker to run the adapter, you can build the image by running the following command:

```bash
docker build . -t bnc-convert-adapter
```

Then run it with:

```bash
docker run -p 8080:8080 -e API_KEY='YOUR_API_KEY' -it bnc-convert-adapter:latest
```

## Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `cl-bnc-convert.zip` file
- Handler should remain index.handler
- Add the environment variable (repeat for all environment variables):
  - Key: API_KEY
  - Value: Your_API_key
- Save


## Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `cl-bnc-convert.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
- Click More, Add variable (repeat for all environment variables)
  - NAME: API_KEY
  - VALUE: Your_API_key
