# Medi Wizard - AI Health Assistant

Medi Wizard is an AI-powered health assistant that helps users identify potential health issues based on their symptoms and recommends appropriate medical specialists.

## Features

- Interactive symptom assessment through a conversational interface
- Structured questionnaire with general and symptom-specific questions
- Doctor recommendation system based on symptom analysis
- Simple and intuitive GUI with a friendly robotic doctor theme
- Standalone executable that works without internet connection

## Installation

### Option 1: Run from Source

1. Ensure you have Python 3.7+ installed
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python medi_wizard.py
   ```

### Option 2: Build Executable

1. Install cx_Freeze:
   ```
   pip install cx_Freeze
   ```
2. Build the executable:
   ```
   python setup.py build
   ```
3. The executable will be created in the `build` directory

## Usage

1. Launch the application
2. Answer the questions about your symptoms
3. Receive a recommendation for which type of doctor to see
4. Type 'new' to start a new consultation

## Disclaimer

Medi Wizard is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.