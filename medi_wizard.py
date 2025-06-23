import tkinter as tk
from tkinter import ttk, scrolledtext
import json
import os
from PIL import Image, ImageTk
import customtkinter as ctk
import random
import sys
from typing import Dict, List, Tuple, Any, Optional

# Set appearance mode and default color theme
ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

class MediWizard:
    def __init__(self, root):
        self.root = root
        self.root.title("Medi Wizard - Your Health Assistant")
        self.root.geometry("900x700")
        self.root.minsize(800, 600)
        
        # Create an icon for the window
        if getattr(sys, 'frozen', False):
            # If the application is run as a bundle
            application_path = sys._MEIPASS
        else:
            # If the application is run as a script
            application_path = os.path.dirname(os.path.abspath(__file__))
            
        # Setup variables
        self.user_responses = {}
        self.current_question_type = "initial"
        self.question_index = 0
        self.conversation_history = []
        self.user_profile = {"gender": None, "age": None, "pregnant": False}
        
        # Load questions and recommendations
        self.load_medical_data()
        
        # Create the main frame
        self.create_ui()
        
        # Start the conversation
        self.greet_user()

    def load_medical_data(self):
        """Load questions and medical recommendation data"""
        self.questions = {
            "initial": [
                "Can you tell me what symptoms you have?",
                "How long have you had these symptoms?",
                "Is the pain or problem getting worse, better, or staying the same?",
                "Do you have a fever, chills, or feel very tired?",
                "Is anything making it better or worse?",
                "Have you had this problem before?",
                "Are you taking any medicine now?",
                "Do you have any known health problems (like diabetes, asthma, heart issues)?",
            ],
            "pain": [
                "Where exactly do you feel the pain?",
                "Is the pain sharp, dull, throbbing, or burning?",
                "Does the pain come and go or is it always there?",
                "Can you rate the pain from 1 (mild) to 10 (very bad)?"
            ],
            "stomach": [
                "Are you feeling nauseous or have you vomited?",
                "Do you have diarrhea or constipation?",
                "Have you noticed blood in your stool or when you go to the toilet?"
            ],
            "breathing": [
                "Do you feel short of breath when resting or only after activity?",
                "Do you hear any wheezing or whistling when you breathe?",
                "Are you coughing a lot? Is it dry or with mucus?"
            ],
            "dizziness": [
                "Did it happen suddenly or slowly?",
                "Did you fall or hurt yourself?",
                "Did you lose consciousness (black out)?"
            ],
            "mental": [
                "Have you been feeling sad, anxious, or stressed a lot lately?",
                "Are you having trouble sleeping or eating?",
                "Do you feel like you're not interested in things anymore?"
            ]
        }
        
        self.gender_specific = {
            "female": ["Are you pregnant or could you be pregnant?"]
        }
        
        self.caring_responses = [
            "Thanks for telling me. That sounds uncomfortable.",
            "I'm sorry you're going through that. Let's try to figure out what kind of doctor you should see.",
            "I understand. Let's get you the right help.",
            "That can be worrying. You're doing the right thing by checking."
        ]
        
        self.doctor_recommendations = {
            "general": "general physician",
            "stomach": "gastroenterologist",
            "skin": "dermatologist",
            "breathing": "pulmonologist",
            "mental": "psychiatrist or therapist",
            "head": "neurologist",
            "heart": "cardiologist",
            "joint": "rheumatologist",
            "eye": "ophthalmologist",
            "ear": "otolaryngologist (ENT)",
            "pregnancy": "obstetrician",
            "children": "pediatrician",
            "hormone": "endocrinologist",
            "kidney": "nephrologist",
            "bone": "orthopedist",
            "allergy": "allergist",
            "urinary": "urologist",
            "female": "gynecologist"
        }
        
        # Symptoms to doctor mapping
        self.symptom_doctor_map = {
            "headache": ["general", "head"],
            "migraine": ["head"],
            "fever": ["general"],
            "chest pain": ["heart", "general"],
            "shortness of breath": ["breathing", "heart"],
            "cough": ["breathing", "general"],
            "stomach pain": ["stomach", "general"],
            "nausea": ["stomach"],
            "vomiting": ["stomach"],
            "diarrhea": ["stomach"],
            "constipation": ["stomach"],
            "rash": ["skin", "allergy"],
            "itching": ["skin", "allergy"],
            "joint pain": ["joint", "bone"],
            "muscle pain": ["general", "bone"],
            "back pain": ["bone", "general"],
            "fatigue": ["general", "hormone"],
            "depression": ["mental"],
            "anxiety": ["mental"],
            "dizziness": ["head", "general"],
            "fainting": ["general", "heart"],
            "bleeding": ["general"],
            "weight loss": ["general", "hormone"],
            "weight gain": ["hormone", "general"],
            "blurry vision": ["eye"],
            "hearing loss": ["ear"],
            "sore throat": ["general", "ear"],
            "urination problems": ["urinary", "kidney"],
            "pregnant": ["pregnancy"]
        }

    def create_ui(self):
        """Create the user interface"""
        # Create frames
        self.main_frame = ctk.CTkFrame(self.root, corner_radius=0)
        self.main_frame.pack(fill="both", expand=True)
        
        # Create header frame
        self.header_frame = ctk.CTkFrame(self.main_frame, height=80, corner_radius=0, fg_color="#3B82F6")
        self.header_frame.pack(fill="x", side="top")
        
        # Header title
        self.header_label = ctk.CTkLabel(
            self.header_frame, 
            text="Medi Wizard", 
            font=ctk.CTkFont(family="Arial", size=24, weight="bold"),
            text_color="#FFFFFF"
        )
        self.header_label.pack(pady=20)
        
        # Create content frame with doctor image and chat area
        self.content_frame = ctk.CTkFrame(self.main_frame, corner_radius=0, fg_color="#F8FAFC")
        self.content_frame.pack(fill="both", expand=True)
        
        # Create doctor frame (left side)
        self.doctor_frame = ctk.CTkFrame(self.content_frame, width=300, corner_radius=0, fg_color="#F1F5F9")
        self.doctor_frame.pack(fill="y", side="left")
        
        # Doctor image placeholder
        self.doctor_image_label = ctk.CTkLabel(
            self.doctor_frame, 
            text="🤖\nRobo\nDoc", 
            font=ctk.CTkFont(family="Arial", size=48, weight="bold"),
            text_color="#3B82F6"
        )
        self.doctor_image_label.pack(pady=50)
        
        # Doctor name
        self.doctor_name_label = ctk.CTkLabel(
            self.doctor_frame, 
            text="Dr. Medi Wizard", 
            font=ctk.CTkFont(family="Arial", size=16, weight="bold"),
            text_color="#1E40AF"
        )
        self.doctor_name_label.pack()
        
        # Doctor title
        self.doctor_title_label = ctk.CTkLabel(
            self.doctor_frame, 
            text="AI Health Assistant", 
            font=ctk.CTkFont(family="Arial", size=14),
            text_color="#64748B"
        )
        self.doctor_title_label.pack()
        
        # Create chat frame (right side)
        self.chat_frame = ctk.CTkFrame(self.content_frame, corner_radius=0, fg_color="#F8FAFC")
        self.chat_frame.pack(fill="both", expand=True, side="right")
        
        # Chat display area
        self.chat_display = scrolledtext.ScrolledText(
            self.chat_frame, 
            wrap=tk.WORD, 
            font=("Arial", 12),
            bg="#FFFFFF", 
            fg="#1E293B",
            bd=0,
            padx=10,
            pady=10
        )
        self.chat_display.pack(fill="both", expand=True, padx=20, pady=20)
        self.chat_display.config(state=tk.DISABLED)
        
        # Add tags for message formatting
        self.chat_display.tag_config("user", foreground="#3B82F6", font=("Arial", 12, "bold"))
        self.chat_display.tag_config("bot", foreground="#1E293B", font=("Arial", 12))
        self.chat_display.tag_config("bot_name", foreground="#3B82F6", font=("Arial", 12, "bold"))
        self.chat_display.tag_config("recommendation", foreground="#10B981", font=("Arial", 12, "bold"))
        
        # Create input frame
        self.input_frame = ctk.CTkFrame(self.main_frame, height=100, corner_radius=0, fg_color="#FFFFFF")
        self.input_frame.pack(fill="x", side="bottom")
        
        # Create user input field
        self.user_input = ctk.CTkEntry(
            self.input_frame, 
            placeholder_text="Type your response here...",
            width=700,
            height=40,
            border_width=1,
            corner_radius=20,
            fg_color="#FFFFFF",
            border_color="#E2E8F0"
        )
        self.user_input.pack(side="left", padx=20, pady=30)
        
        # Create send button
        self.send_button = ctk.CTkButton(
            self.input_frame, 
            text="Send", 
            width=100,
            height=40,
            corner_radius=20,
            fg_color="#3B82F6",
            hover_color="#2563EB",
            command=self.process_user_input
        )
        self.send_button.pack(side="left", padx=(0, 20), pady=30)
        
        # Bind Enter key to send message
        self.user_input.bind("<Return>", lambda event: self.process_user_input())

    def greet_user(self):
        """Start the conversation with a greeting"""
        greeting = (
            "Hello! I'm Dr. Medi Wizard, your AI health assistant. "
            "I can help you understand your symptoms and recommend the right doctor to see. "
            "Please note that I am not a replacement for professional medical advice.\n\n"
            "Let's get started with a few questions to better understand your situation."
        )
        self.add_bot_message(greeting)
        self.ask_next_question()

    def add_bot_message(self, message):
        """Add a bot message to the chat display"""
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.insert(tk.END, "Dr. Medi Wizard: ", "bot_name")
        self.chat_display.insert(tk.END, f"{message}\n\n", "bot")
        self.chat_display.see(tk.END)
        self.chat_display.config(state=tk.DISABLED)
        self.conversation_history.append({"role": "assistant", "content": message})

    def add_user_message(self, message):
        """Add a user message to the chat display"""
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.insert(tk.END, "You: ", "user")
        self.chat_display.insert(tk.END, f"{message}\n\n", "bot")
        self.chat_display.see(tk.END)
        self.chat_display.config(state=tk.DISABLED)
        self.conversation_history.append({"role": "user", "content": message})

    def process_user_input(self):
        """Process the user's input"""
        user_input = self.user_input.get().strip()
        if not user_input:
            return
        
        self.add_user_message(user_input)
        self.user_input.delete(0, tk.END)
        
        # Save the response to the current question
        if self.current_question_type and self.question_index > 0:
            if self.current_question_type not in self.user_responses:
                self.user_responses[self.current_question_type] = {}
            
            current_q = self.get_current_question()
            if current_q:
                self.user_responses[self.current_question_type][current_q] = user_input
        
        # Check if we should change the question type based on symptoms
        if self.current_question_type == "initial" and self.question_index == 1:
            # After getting symptoms, determine which follow-up questions to ask
            symptoms = user_input.lower()
            
            if any(term in symptoms for term in ["pain", "ache", "hurt", "sore"]):
                self.add_question_type("pain")
            
            if any(term in symptoms for term in ["stomach", "nausea", "vomit", "diarrhea", "constipation"]):
                self.add_question_type("stomach")
                
            if any(term in symptoms for term in ["breath", "cough", "wheeze", "lung"]):
                self.add_question_type("breathing")
                
            if any(term in symptoms for term in ["dizzy", "faint", "vertigo", "balance"]):
                self.add_question_type("dizziness")
                
            if any(term in symptoms for term in ["sad", "depress", "anxious", "anxiety", "stress", "mental"]):
                self.add_question_type("mental")
            
            # Check for gender-specific questions if in initial stage
            if "female" in self.user_profile.get("gender", "").lower():
                self.add_gender_specific_questions()
        
        # If we're at the end of the questions, give a recommendation
        self.ask_next_question()

    def add_question_type(self, question_type):
        """Add a question type to the current conversation"""
        if question_type not in self.questions:
            return
            
        # If we're adding a new question type, add it to the user responses
        if question_type not in self.user_responses:
            self.user_responses[question_type] = {}
            
    def add_gender_specific_questions(self):
        """Add gender-specific questions based on the user's gender"""
        gender = self.user_profile.get("gender", "").lower()
        if gender in self.gender_specific:
            for question in self.gender_specific[gender]:
                if "initial" not in self.user_responses:
                    self.user_responses["initial"] = {}
                self.user_responses["initial"][question] = None

    def get_current_question(self):
        """Get the current question based on the question type and index"""
        if not self.current_question_type:
            return None
            
        if self.question_index >= len(self.questions.get(self.current_question_type, [])):
            return None
            
        return self.questions[self.current_question_type][self.question_index - 1]

    def ask_next_question(self):
        """Ask the next question in the conversation"""
        # First, check if we need to move to a different question type
        if self.current_question_type and self.question_index >= len(self.questions.get(self.current_question_type, [])):
            # If we've finished the initial questions, move to specialized questions
            if self.current_question_type == "initial":
                # Check which specialized questions we should ask
                for question_type in ["pain", "stomach", "breathing", "dizziness", "mental"]:
                    if question_type in self.user_responses:
                        self.current_question_type = question_type
                        self.question_index = 0
                        break
                else:
                    # If no specialized questions, we're done with questioning
                    self.current_question_type = None
            else:
                # If we've finished a specialized section, check if there are others
                for question_type in ["pain", "stomach", "breathing", "dizziness", "mental"]:
                    if question_type in self.user_responses and question_type != self.current_question_type:
                        if not any(q in self.user_responses[question_type] for q in self.questions[question_type]):
                            self.current_question_type = question_type
                            self.question_index = 0
                            break
                else:
                    # If no more specialized sections, we're done
                    self.current_question_type = None
        
        # If we have a current question type, ask the next question
        if self.current_question_type and self.question_index < len(self.questions.get(self.current_question_type, [])):
            question = self.questions[self.current_question_type][self.question_index]
            self.add_bot_message(question)
            self.question_index += 1
        else:
            # If we're done with questions, give a recommendation
            self.give_recommendation()
    
    def give_recommendation(self):
        """Give a recommendation based on the user's responses"""
        # Add a caring response
        caring_response = random.choice(self.caring_responses)
        self.add_bot_message(caring_response)
        
        # Analyze the symptoms to determine the appropriate doctor
        doctors = self.analyze_symptoms()
        
        if not doctors:
            doctors = ["general physician"]
        
        # Create the recommendation message
        if len(doctors) == 1:
            recommendation = f"Based on your symptoms, I recommend seeing a {doctors[0]}."
        else:
            recommendation = f"Based on your symptoms, I recommend seeing either a {', '.join(doctors[:-1])} or a {doctors[-1]}."
            
        recommendation += "\n\nRemember, this is not a substitute for professional medical advice. If your symptoms are severe or worsening rapidly, please seek immediate medical attention."
        
        # Add the recommendation message
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.insert(tk.END, "Dr. Medi Wizard: ", "bot_name")
        self.chat_display.insert(tk.END, "My Recommendation: ", "bot")
        self.chat_display.insert(tk.END, f"{recommendation}\n\n", "recommendation")
        self.chat_display.see(tk.END)
        self.chat_display.config(state=tk.DISABLED)
        
        # Offer to start a new consultation
        self.add_bot_message("Is there anything else you'd like to discuss? Type 'new' to start a new consultation or any question you might have.")
        
        # Reset for a new consultation if the user types "new"
        self.current_question_type = "new_consultation"
    
    def analyze_symptoms(self):
        """Analyze the symptoms to determine the appropriate doctor"""
        possible_doctors = set()
        
        # Look for keywords in the user's responses
        for question_type, responses in self.user_responses.items():
            for question, response in responses.items():
                if not response:
                    continue
                    
                response = response.lower()
                
                # Check for specific symptoms in the response
                for symptom, doctors in self.symptom_doctor_map.items():
                    if symptom in response:
                        for doctor in doctors:
                            possible_doctors.add(doctor)
        
        # If no specific doctors were found, recommend a general physician
        if not possible_doctors:
            possible_doctors.add("general")
        
        # Convert the doctor codes to full names
        return [self.doctor_recommendations.get(doctor, "general physician") for doctor in possible_doctors]

if __name__ == "__main__":
    root = ctk.CTk()
    app = MediWizard(root)
    root.mainloop()