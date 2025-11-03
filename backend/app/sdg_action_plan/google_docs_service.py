import os
import json
from datetime import datetime
from typing import Dict, Any, Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from django.utils import timezone
import pickle


class OAuthRequired(Exception):
    def __init__(self, auth_url):
        self.auth_url = auth_url
        super().__init__("OAuth flow requires user interaction.")


class GoogleDocsService:
    """Service class for Google Docs API integration"""
    
    # If modifying these scopes, delete the file token.pickle.
    SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive']
    
    def __init__(self):
        self.creds = None
        self.service = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Docs API"""
        try:
            # Check if credentials file exists
            if not os.path.exists('credentials.json'):
                raise FileNotFoundError(
                    "Google API credentials file 'credentials.json' not found. "
                    "Please download your credentials from Google Cloud Console "
                    "and place them in the backend/app directory."
                )
            
            # The file token.pickle stores the user's access and refresh tokens
            if os.path.exists('token.pickle'):
                with open('token.pickle', 'rb') as token:
                    self.creds = pickle.load(token)
            
            # If there are no (valid) credentials available, let the user log in.
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    # 获取auth_url
                    with open('credentials.json', 'r') as f:
                        client_config = json.load(f)
                    flow = Flow.from_client_config(
                        client_config,
                        scopes=self.SCOPES,
                        redirect_uri='http://localhost:8000/api/sdg-action-plan/auth/google/callback/'
                    )
                    auth_url, _ = flow.authorization_url(
                        access_type='offline',
                        include_granted_scopes='true'
                    )
                    raise OAuthRequired(auth_url)
                
                # Save the credentials for the next run
                with open('token.pickle', 'wb') as token:
                    pickle.dump(self.creds, token)
            
            self.service = build('docs', 'v1', credentials=self.creds)
            
        except OAuthRequired as e:
            raise
        except FileNotFoundError as e:
            print(f"Authentication error: {e}")
            raise
        except Exception as e:
            print(f"Authentication error: {e}")
            raise Exception(f"Failed to authenticate with Google Docs API: {e}")
    
    def create_document_from_action_plan(self, action_plan) -> str:
        """Create a Google Doc from an SDG Action Plan"""
        try:
            # Create document title
            title = f"SDG Action Plan - {action_plan.impact_project_name}"
            
            # Create document content
            content = {
                'title': title,
                'body': {
                    'content': [
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'SDG Action Plan\n',
                                            'textStyle': {
                                                'bold': True,
                                                'fontSize': {
                                                    'magnitude': 20,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'\nProject Name: {action_plan.impact_project_name}\n',
                                            'textStyle': {
                                                'bold': True,
                                                'fontSize': {
                                                    'magnitude': 14,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'Designers: {action_plan.name_of_designers}\n',
                                            'textStyle': {
                                                'fontSize': {
                                                    'magnitude': 12,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'\nDescription:\n{action_plan.description}\n',
                                            'textStyle': {
                                                'fontSize': {
                                                    'magnitude': 12,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'\nPlan Content:\n{action_plan.plan_content}\n',
                                            'textStyle': {
                                                'fontSize': {
                                                    'magnitude': 12,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'\nCreated: {action_plan.created_at.strftime("%Y-%m-%d %H:%M:%S")}\n',
                                            'textStyle': {
                                                'italic': True,
                                                'fontSize': {
                                                    'magnitude': 10,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
            
            # Create the document
            document = self.service.documents().create(body=content).execute()
            document_id = document.get('documentId')
            
            print(f'Created document with ID: {document_id}')
            return document_id
            
        except HttpError as error:
            print(f'An error occurred: {error}')
            raise Exception(f'Failed to create Google Doc: {error}')
        except Exception as e:
            print(f'Unexpected error: {e}')
            raise Exception(f'Failed to create Google Doc: {e}')
        
    def create_document(self, title: str, content: Dict[str, Any]) -> Optional[str]:
        """Create a new Google Doc with the given title and content"""
        try:
            # Create document content
            doc_content = {
                'title': title,
                'body': {
                    'content': [
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'{title}\n',
                                            'textStyle': {
                                                'bold': True,
                                                'fontSize': {
                                                    'magnitude': 20,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
            
            # Add content sections
            for key, value in content.items():
                if value:
                    doc_content['body']['content'].extend([
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'\n{key.replace("_", " ").title()}:\n',
                                            'textStyle': {
                                                'bold': True,
                                                'fontSize': {
                                                    'magnitude': 14,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            'paragraph': {
                                'elements': [
                                    {
                                        'textRun': {
                                            'content': f'{value}\n',
                                            'textStyle': {
                                                'fontSize': {
                                                    'magnitude': 12,
                                                    'unit': 'PT'
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ])
            
            # Create the document
            document = self.service.documents().create(body=doc_content).execute()
            document_id = document.get('documentId')
            
            print(f'Created document with ID: {document_id}')
            return document_id
            
        except HttpError as error:
            print(f'An error occurred: {error}')
            return None
        except Exception as e:
            print(f'Unexpected error: {e}')
            return None
    
    def _insert_formatted_content(self, document_id: str, content: Dict[str, Any]):
        """Insert formatted content into the Google Docs document"""
        requests = []
        
        # Document title
        requests.append({
            'insertText': {
                'location': {
                    'index': 1
                },
                'text': f'SDG Action Plan: {content.get("impact_project_name", "Untitled")}\n\n'
            }
        })
        
        current_index = len(f'SDG Action Plan: {content.get("impact_project_name", "Untitled")}\n\n') + 1
        
        # Basic information section
        requests.extend(self._add_section_header(current_index, "Basic Information"))
        current_index += len("Basic Information\n") + 1
        
        # Project details
        requests.extend(self._add_field(current_index, "Project Name", content.get("impact_project_name", "")))
        current_index += len(f"Project Name: {content.get('impact_project_name', '')}\n") + 1
        
        requests.extend(self._add_field(current_index, "Designers", content.get("name_of_designers", "")))
        current_index += len(f"Designers: {content.get('name_of_designers', '')}\n") + 1
        
        requests.extend(self._add_field(current_index, "Description", content.get("description", "")))
        current_index += len(f"Description: {content.get('description', '')}\n\n") + 1
        
        # Plan content section
        plan_content = content.get("plan_content", {})
        
        requests.extend(self._add_section_header(current_index, "Plan Content"))
        current_index += len("Plan Content\n") + 1
        
        # SDGs
        sdgs = plan_content.get("SDGs", [])
        if sdgs:
            requests.extend(self._add_field(current_index, "Related SDGs", ", ".join(sdgs)))
            current_index += len(f"Related SDGs: {', '.join(sdgs)}\n") + 1
        
        # Role
        requests.extend(self._add_field(current_index, "Role and Affiliation", plan_content.get("role", "")))
        current_index += len(f"Role and Affiliation: {plan_content.get('role', '')}\n") + 1
        
        # Challenge
        requests.extend(self._add_field(current_index, "Main Challenge", plan_content.get("challenge", "")))
        current_index += len(f"Main Challenge: {plan_content.get('challenge', '')}\n") + 1
        
        # Implementation Steps
        requests.extend(self._add_section_header(current_index, "Implementation Steps"))
        current_index += len("Implementation Steps\n") + 1
        
        steps = plan_content.get("steps", {})
        for i in range(1, 7):
            step_key = f"input{i}"
            step_content = steps.get(step_key, "")
            if step_content:
                requests.extend(self._add_field(current_index, f"Step {i}", step_content))
                current_index += len(f"Step {i}: {step_content}\n") + 1
        
        # Impact Types
        impact_types = plan_content.get("impact_types", {})
        if any(impact_types.values()):
            requests.extend(self._add_section_header(current_index, "Impact Types"))
            current_index += len("Impact Types\n") + 1
            
            for rank, impact_type in impact_types.items():
                if impact_type:
                    requests.extend(self._add_field(current_index, f"Rank {rank[-1]}", impact_type))
                    current_index += len(f"Rank {rank[-1]}: {impact_type}\n") + 1
        
        # Other fields
        other_fields = [
            ("importance", "Impact Importance"),
            ("example", "Existing Example"),
            ("resources", "Resources and Partnerships"),
            ("impact", "Impact Avenues"),
            ("risk", "Risks and Inhibitors"),
            ("mitigation", "Mitigation Strategies")
        ]
        
        for field_key, field_name in other_fields:
            field_value = plan_content.get(field_key, "")
            if field_value:
                requests.extend(self._add_field(current_index, field_name, field_value))
                current_index += len(f"{field_name}: {field_value}\n") + 1
        
        # Execute the requests
        if requests:
            self.service.documents().batchUpdate(
                documentId=document_id,
                body={'requests': requests}
            ).execute()
    
    def _add_section_header(self, index: int, title: str) -> list:
        """Add a section header with formatting"""
        return [
            {
                'insertText': {
                    'location': {'index': index},
                    'text': f'{title}\n'
                }
            },
            {
                'updateParagraphStyle': {
                    'range': {
                        'startIndex': index,
                        'endIndex': index + len(title)
                    },
                    'paragraphStyle': {
                        'namedStyleType': 'HEADING_1'
                    },
                    'fields': 'namedStyleType'
                }
            }
        ]
    
    def _add_field(self, index: int, field_name: str, field_value: str) -> list:
        """Add a field with label and value"""
        return [
            {
                'insertText': {
                    'location': {'index': index},
                    'text': f'{field_name}: {field_value}\n'
                }
            },
            {
                'updateTextStyle': {
                    'range': {
                        'startIndex': index,
                        'endIndex': index + len(field_name)
                    },
                    'textStyle': {
                        'bold': True
                    },
                    'fields': 'bold'
                }
            }
        ]
    
    def update_document(self, document_id: str, content: Dict[str, Any]) -> bool:
        """Update existing Google Docs document with new content"""
        try:
            # Clear existing content (except title)
            document = self.service.documents().get(documentId=document_id).execute()
            content_length = document['body']['content'][-1]['endIndex'] - 1
            
            if content_length > 1:
                self.service.documents().batchUpdate(
                    documentId=document_id,
                    body={
                        'requests': [
                            {
                                'deleteContentRange': {
                                    'range': {
                                        'startIndex': 1,
                                        'endIndex': content_length
                                    }
                                }
                            }
                        ]
                    }
                ).execute()
            
            # Insert new content
            self._insert_formatted_content(document_id, content)
            return True
            
        except HttpError as error:
            print(f'An error occurred: {error}')
            return False
    
    def get_document_url(self, document_id: str) -> str:
        """Get the shareable URL for a Google Docs document"""
        return f"https://docs.google.com/document/d/{document_id}/edit"
    
    def share_document(self, document_id: str, email: str, role: str = 'writer') -> bool:
        """Share the document with a specific user"""
        try:
            drive_service = build('drive', 'v3', credentials=self.creds)
            
            user_permission = {
                'type': 'user',
                'role': role,
                'emailAddress': email
            }
            
            drive_service.permissions().create(
                fileId=document_id,
                body=user_permission,
                fields='id'
            ).execute()
            
            return True
            
        except HttpError as error:
            print(f'An error occurred: {error}')
            return False 