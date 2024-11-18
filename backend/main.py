import uvicorn
import io
import os
import base64
import logging
import boto3
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, Form, HTTPException
from botocore.exceptions import NoCredentialsError, ClientError
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from PIL import Image
import qrcode  # Make sure to install the qrcode library

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AWS S3 Configuration
s3 = boto3.client('s3')
bucket_name = "qr-codes-generator"

def create_bucket(bucket_name):
    try:
        s3.head_bucket(Bucket=bucket_name)
        print(f"Bucket {bucket_name} already exists. Using the existing bucket.")
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            try:
                s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': 'us-west-2'}
                )
                print(f"Bucket {bucket_name} created successfully.")
            except ClientError as create_error:
                print(f"Error creating bucket: {create_error}")
        else:
            print(f"Error accessing bucket: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics initialization
instrumentator = Instrumentator().instrument(app).expose(app)

# Call this function when initializing your application
create_bucket(bucket_name)

# Use the instrumentator to track metrics
@app.on_event("startup")
async def startup():
    logger.info("Application has started")


# Pydantic model for text, email, and URL input
class QRCodeData(BaseModel):
    data_type: str
    data: str

# Endpoint for generating QR code from text, email, or URL
@app.post("/generate-qr/")
async def generate_qr(data: QRCodeData):
    try:
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data.data)
        qr.make(fit=True)

        # Create the QR code image
        img = qr.make_image(fill='black', back_color='white')

        # Convert the image to base64 string
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Return the base64-encoded image in the response
        return JSONResponse(content={"image_data": img_base64}, status_code=200)

    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Endpoint for generating QR code from images
@app.post("/generate-qr-image/")
async def generate_qr_image(file: UploadFile):
    try:
        # Step 1: Upload the image to S3
        file_url = await upload_image_to_s3(file)

        # Step 2: Generate a QR code with the S3 file URL
        qr = qrcode.QRCode(
            version=None,  # Auto-adjust based on content size
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(file_url)  # Use S3 URL instead of raw image data
        qr.make(fit=True)

        # Step 3: Create a QR code image
        img = qr.make_image(fill_color="black", back_color="white")

        # Step 4: Convert the QR code image to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        # Step 5: Return the base64-encoded QR code image
        return JSONResponse(content={"image_data": img_base64}, status_code=200)

    except Exception as e:
        logger.error(f"Error generating QR code: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

async def upload_image_to_s3(file: UploadFile) -> str:
    """Upload an image to S3 and return the file URL."""
    try:
        # Upload the file to S3
        s3.upload_fileobj(
            file.file,
            bucket_name,
            file.filename,
            ExtraArgs={"ContentType": file.content_type}
        )

        # Generate the public S3 URL
        file_url = f"https://{bucket_name}.s3.amazonaws.com/{file.filename}"
        return file_url

    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not found.")
    except ClientError as e:
        logger.error(f"S3 upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload to S3")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
