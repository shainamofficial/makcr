# Makcr

## Long Term Vision
The long term vision is to build an AI Native Linkedin where the AI can interview a user and help build the career graph of the user   which is the key moat of this product. The AI should ask enough follow up questions so that the user provides good and important points like impact, skills, etc., that can be added to the career graph of the user.

This career graph becomes the cornerstone of the product that will be used to:
* v1: Generate tailored resumes for the user based on a pasted Job Description.
* v2: Enable recruiters to search for applicants by chatting with the AI
* v3: Allow applicants to post jobs and identify how many applicants would match depending on the job description and requirements
* v4: Allow users to figure out how they can improve their skills to advance in their career.

## V1 Requirements
In V1, the key requirement is to build the AI that interviews users and helps build their career graph which will then be utilised to generate resumes based on job descriptions.

### Pages Required
#### 1. Landing Page
The Landing Page will showcase and sell the long-term vision of the product and clearly showcase what the future iterations would be (v2, v3, v4) as "Coming Soon". 

#### 2. Sign-up/Login
The user should be able to sign up or login using Google SSO.

#### 3. AI Career Interview Page
This is the page where the AI will first identify if there is already a career graph for the user. The objective for the AI would be to keep the career graph of the user as updated as possible. So the initial conversation would be very different if it is a new user vs an existing user:
* If it is a new user, the AI would need to build the user's career graph from scratch.
* If it is an existing user, the AI should display a summary of the user's career graph along with when it was updated and ask if there is any update recently.

The AI should ask follow-up questions to ensure that they get the necessary response for a work experience point. For example, if a user says that "they shipped a new onboarding flow", the follow up questions asked should be - "During which role in which company, etc". It should also ask "What is the impact of this initiative?", "Were you the owner and who did you work with?", etc. etc.

Key questions that the AI should ask about the user is:

* Work experience
  * Company where the user worked
	  * The company name should be fetched from proper sources so that it is structured. The AI should verify with the user if the company is correct or recommend the correct name to ensure that it is stored properly in the system.
	  * Ask the user to provide a link to the company website along with a link to the Linkedin page of the company.
	  * This should be stored and utilized to store the company in a structured way. Ask relevant questions to the user to prevent duplicate companies being stored in the system.
  * Their Title/Role
	  * The title/role should ideally be structured as well and the AI should ask the user to confirm the role before storing it.
  * The start and end date of each role in a company
  * Work experience points for each role in a company
  * Work experience points should contain enough useful information like skills, impact, features they built, initiatives they led, etc.
  * User should also be able to add links to help back their work experience points
  
* Other Projects
	 * Projects outside of work. This could include anything ranging from hobbies to vibe coded products to actual real world products.
	 * Some projects might have been done while the user is being educated at some institute or doing some course. So it should be linkable to an education as well.
 * Education
	 * Institute where the user studied
	 * Ask the user to submit a website and/or linkedin page of the institute (optional)
	 * Keep the institute name structured and ask the user to confirm if the name is correct before storing to prevent any duplicates.
	 * Ask what the degree and discipline was for each institute. An example of degree is Bachelor of Technology (B.Tech.). An example of discipline is Electrical Engineering. As much as possible, try to keep this structured and ask the user to confirm from something existing but also allow to modify and then store it. However, reduce duplicates in the degree and discipline tables as much as possible.
	 * Extra-curriculars
		 * Ask the user about any extra-curricular activites that they were a part of in college along with a start and end date.
		 * There will many extra curricular types like sports, music, etc.
		 * Store this in a structured way.
	 * Positions of Responsibilities
		 * Ask the user if they had any official position of responsibility in any student organization of the institute where they were educated.
		 * Store this in a structured way.


* Skills
	* When the user is answering questions about their education or work experience, identify if there is a skill set that the user talked about. Ask follow-up questions to confirm the skill set along with proficiency and years of experience.  Also, ask the right questions to confirm the skill with the user. As much as possible, prevent duplicates in the skill table.

The AI should also ask the user to upload a professional display picture which the user can decide whether to make it available or not on a specific resume.


##### 3.A. For New Users
Instructions for the AI:
* Explain the purpose of the interview and how it will help them in their career.
* The tone should be conversational, motivational and friendly.

##### 3.B. For Existing Users
Instructions for the AI:
* Display full details of the user's existing career graph and when it was last updated.
* Welcome the user back. Say something motivational. Ask if there has been any update to their career since the career graph was last updated.

#### 4. User Profile Dashboard
In this dashboard, the user can view their entire career graph. It should be very pleasing to the eye and a clean and intuitive UI.

The career graph will be detailed and the user should also be able to manually edit it.

The profile dashboard should also have a summary for the user to look at.

#### 5. Resume Dashboard
This is where the user can view all past resumes created and also generate new resumes.

To generate a new resume, the user should be able to paste the full job description into a text field.

When generating a resume, the AI performs a qualitative comparison of the job description against the user's career graph. If the AI identifies job requirements where the user's profile has no relevant experience or skills, it should highlight these gaps to the user and ask if they have any unlisted experience that applies. If not, the AI should briefly suggest what the user could do to build that experience in the future. This is not a scored match — it is a conversational, best-effort analysis by the AI. 

There should be a tab which lists all resume's generated along with the job description used.

The user should be able to choose the template of the resume they want. The user should be able to pick from multiple sample examples resume for the template of the resume generated.

The user should also be able to choose whether they want their image to be included or not.

When a user generates a resume, a new `chat_session` is created with `session_type` set to `resume_generation`. The AI's qualitative gap analysis and any follow-up conversation about missing experience are stored as `chat_message` entries under this session. The user should be able to view the chat history for each resume from the Resume Dashboard.

#### Navigation

Logged-out users see the Landing Page with "Sign Up" and "Login" buttons in the top navigation bar.

Logged-in users see a persistent top navigation bar with:
* **Makcr logo** (links to Profile Dashboard)
* **AI Interview** (links to AI Career Interview Page)
* **Profile** (links to User Profile Dashboard)
* **Resumes** (links to Resume Dashboard)
* **User avatar/name** with a dropdown menu containing: Settings, Log Out

On mobile, the navigation collapses into a hamburger menu.

### Database
Database schemas are as follows:

* user
	* id
	* first_name
	* middle_name
	* last_name
	* email
	* phone_number
	* profile_summary
		* A 2-3 sentence professional summary auto-generated by the AI at the end of the career interview based on the user's work experience, education, skills, and projects. The user can manually edit this from the Profile Dashboard.
	* years_of_experience
		* Auto-calculated from the user's work experience entries. Computed as the total number of years between the earliest `start_date` and the latest `end_date` (or current date if any role is ongoing) across all `work_experience` records. Recalculated whenever work experience is added, updated, or deleted.
	* profile_picture_id
		* references the id in profile_picture table 
		* nullable — will be null until the user uploads a profile picture
	* created_at
	* updated_at

* resume
	* id
	* title
		* A short label for the resume, auto-generated from the job description (e.g., "Product Manager — Google") but editable by the user. Displayed in the resume list view on the Resume Dashboard.
	* user_id
		* this references to the id in user table
	* job_description
	* generated_resume_link
		* Public URL pointing to the generated resume PDF stored in Supabase Storage. Populated once the resume PDF has been generated and uploaded. Null while the resume status is "in_progress".
	* include_profile_picture
		* boolean
	* resume_template_id
		* references the id in resume_template
	* created_at
	* updated_at
	* chat_session_id 
		* references the id in chat_session table 
		* nullable — will be null for resumes generated without a gap analysis conversation 
		* Links the resume to its resume_generation chat session so the user can view the conversation history from the Resume Dashboard.
	* status 
		* String enum with values: "in_progress", "completed" 
		* "in_progress" means the user has pasted a JD and the AI gap analysis conversation is ongoing but the PDF has not been generated yet. 
		* "completed" means the resume PDF has been generated and uploaded to Supabase Storage. 
		* The Resume Dashboard should only show "completed" resumes in the main list. "in_progress" resumes should appear in a separate "Drafts" section or be visually distinguished.

* resume_template
	* id
	* name
		* e.g. "Classic", "Modern", "Minimal"
	* description
	* preview_image_url
		* a screenshot/thumbnail for the user to browse
	* template_config
		* JSON field storing layout rules (font, spacing, section order, color scheme, whether it supports a photo or not)
	* is_active
		* boolean, so you can retire templates without deleting them
	* created_at
	* updated_at

* company
	* created_at
	* updated_at
	* id
	* name
	* industry
	* website
	* linkedin_page
	* hq_city
	* hq_country

* work_experience
	* created_at
	* updated_at
	* id
	* user_id
		* references the id in user table
	* company_id
		* references the id in company table
	* title
	* start_date
	* end_date
	* description
	* is_full_remote
		* boolean field

* work_experience_points
	* id
	* work_experience_id
		* references the id in work_experience table
	* details
	* impact
	* links
		* JSON array of URL strings (e.g., ["https://blog.company.com/feature-launch", "https://github.com/user/repo"]) 
		* nullable
	* created_at
	* updated_at

* skill
	* id
	* skill_name
	* category
		* Seed values: "Programming Language", "Framework & Library", "Tool & Platform", "Database", "Cloud & Infrastructure", "Design", "Data & Analytics", "Marketing", "Management", "Soft Skill", "Domain Knowledge", "Language", "Other"
	* created_at
	* updated_at

* user_skill_mapping
	* created_at
	* updated_at
	* id
	* user_id
		* references the id in user table
	* skill_id
		* references the id in skill table
	* proficiency
		* String enum with values: "Beginner", "Intermediate", "Advanced", "Expert". The AI should ask the user to self-assess their proficiency during the interview and confirm before storing.
	* years_of_experience

* project
	* created_at
	* updated_at
	* id
	* user_id
		* this references the id in user table
	* title
	* description
	* project_type_id
		* references to the id in project_type table
	* start_date
	* end_date
	* project_urls
		* JSON array of URL strings (e.g., ["https://github.com/user/repo", "https://myproject.com"]) 
		* nullable
	* education_id
		* this references the id in education table
		* this is nullable

* project_type
	* id
	* type
		* Seed values: "Open Source", "Freelance", "Hobby", "Academic", "Hackathon", "Vibecoding", "Side Business", "Research", "Volunteer", "Course Project"
	* created_at
	* updated_at

* extra_curricular
	* created_at 
	* updated_at 
	* id 
	* education_id 
		* this references the id in education table 
	* title 
		* A short name for the activity (e.g., "Varsity Basketball Team", "Classical Guitar", "Model United Nations") 
	* start_date 
	* end_date 
	* description 
	* extra_curricular_type_id 
		* references the id in extra_curricular_type table

* extra_curricular_type
	* id
	* created_at
	* updated_at
	* type
		* Seed values: "Sports", "Music", "Debate", "Volunteering", "Cultural", "Technical Club", "Arts & Design", "Entrepreneurship", "Social Service", "Media & Journalism", "Academic Society"

* position_of_responsibility
	* created_at
	* updated_at
	* id
	* education_id
		* references the id in education table
	* start_date
	* end_date
	* title
	* institution_organization_id
		* references the id in institution_organization table
	* description

* education
	* created_at
	* updated_at
	* id
	* user_id
		* references the id in user table
	* institution_id
		* references the id in institution table
	* degree_id
		* references the id in degree table
	* discipline_id
		* references the id in discipline table
	* start_date
	* end_date

* institution
	* created_at
	* updated_at
	* id
	* institution_name
	* institution_type
		* Seed values: "University", "College", "Community College", "Online Platform", "Bootcamp", "High School", "Trade School", "Research Institute", "Other", "School"
	* website
	* linkedin_page
	* city
	* country

* degree
	* created_at
	* updated_at
	* id
	* degree_name

* discipline
	* created_at
	* updated_at
	* id
	* discipline_name

* institution_organization
	* created_at
	* updated_at
	* id
	* institution_id
		* references the id in institution table
	* name
	* website
		* nullable
	* linkedin_page
		* nullable

* profile_picture
	* created_at
	* updated_at
	* id
	* user_id
	* link_to_storage
		* Public URL pointing to the uploaded profile picture stored in Supabase Storage.

* chat_session
	* id
	* user_id
		* references the id in user table
	* status
		* something like `in_progress`, `completed`, `abandoned`
	* session_type
		* e.g. `initial_interview`, `update`, `resume_generation`
	* current_topic
		* tracks where the AI left off (e.g. `work_experience`, `education`, `skills`) so it can resume intelligently
	* created_at
	* updated_at

* chat_message
	* id
	* chat_session_id
		* references the id in chat_session table
	* role
		* `user` or `assistant`
	* content
		* the message text
	* structured_data_extracted
		* nullable JSON field capturing any structured data the AI pulled from that specific message (e.g. `{"company": "Google", "title": "PM"}`)
	* created_at



### Tech Stack
  
Frontend:  
Next.js + React  
  
Backend:  
Supabase  
  
Authentication:  
Supabase Auth  
  
Database:  
PostgreSQL (Supabase)  
  
Vector Search:  
pgvector (deferred to v2). In v2, pgvector will be used to generate embeddings of user career graphs and job descriptions to enable semantic matching between recruiters and applicants. It is not actively used in v1 but the extension should be enabled on the Supabase PostgreSQL instance during setup so it is ready for v2.
  
AI:  
Claude Opus 4.6

### Resume Generation & Storage:
Generated resumes are rendered server-side using a Next.js API route that takes the user's career graph data and the selected resume template, and produces a PDF. The PDF is uploaded to Supabase Storage and the public URL is saved in the `generated_resume_link` field on the `resume` table. Each template corresponds to a React component that renders the resume layout; the API route uses a headless browser (e.g., Puppeteer) to convert the rendered HTML to PDF.

### AI Architecture 
The AI interview system uses a **Next.js API route layer** between the frontend and both Claude and Supabase. The AI does not write to the database directly. 
#### Request Flow 
1. User sends a message from the AI Career Interview Page. 
2. The frontend sends the message to a Next.js API route (`/api/chat`). 
3. The API route: 
	* Fetches the user's existing career graph from Supabase for context. 
	* Fetches the conversation history from the `chat_message` table. 
	* Constructs the Claude prompt with the career graph context, conversation history, and the AI system instructions. 
4. Claude responds with a structured JSON object containing: 
	*  `user_message`: The conversational response to display to the user. 
	* `extracted_data`: An array of structured data objects to write to the database (nullable, only present when the AI has confirmed data with the user). 
	* `pending_confirmations`: An array of items the AI needs the user to confirm before storing (e.g., "Is the company Google LLC or Alphabet Inc.?"). 
	* `current_topic`: The topic the AI is currently exploring (e.g., `work_experience`, `education`, `skills`, `projects`). 
5. The API route:
	* Validates the `extracted_data` against the database schema. 
	* Checks for duplicates in lookup tables (company, institution, degree, discipline, skill). 
	* Writes confirmed data to Supabase. 
	* Stores the assistant's message in the `chat_message` table. 
	* Updates the `current_topic` on the `chat_session` record. 
6. The API route returns the `user_message` to the frontend for display. 

#### Claude Response Format

The Claude API should be instructed to always respond in the following JSON structure:
```json
{
  "user_message": "Great! So you were a Product Manager at Google from Jan 2020 to June 2023. What were your key achievements in this role?",
  "extracted_data": [
    {
      "table": "work_experience",
      "action": "create",
      "data": {
        "company_name": "Google",
        "title": "Product Manager",
        "start_date": "2020-01",
        "end_date": "2023-06",
        "is_full_remote": false
      },
      "requires_lookup": {
        "company_name": "company"
      }
    }
  ],
  "pending_confirmations": [
    {
      "type": "company_lookup",
      "message": "I found 'Google LLC' in our records. Is that the correct company?",
      "options": ["Google LLC", "Enter a different name"]
    }
  ],
  "current_topic": "work_experience_points"
}
```

#### Key Rules for the API Layer 
* Never write to the database without validating data types, required fields, and foreign key references. 
* Always check lookup tables (company, institution, degree, discipline, skill) for existing matches before creating new records. Use fuzzy matching where appropriate. 
* Store every message (both user and assistant) in the `chat_message` table to maintain full conversation history. 
* If Claude returns malformed JSON or the response fails validation, retry once. If it fails again, return a generic "Sorry, something went wrong. Could you repeat that?" message to the user.

### AI System Instructions

The AI assistant must follow these rules:

#### General Behavior
1. Ask one question at a time.
2. Always provide examples to help the user answer.
3. Ask follow-up questions when answers are vague.
4. Encourage quantified achievements. Example: Instead of accepting "I worked on marketing", encourage: "I managed $50k monthly ad spend generating 2000 leads."
5. Extract structured data from user responses.
6. Store the structured data in the database via the API layer.
7. Continue asking questions until the profile is complete.

#### Conversation Flow Order
8. For new users, follow this section order:
	* Start with **Work Experience** (most recent role first, then work backwards).
	* Then **Education** (most recent first), including extra-curriculars and positions of responsibility for each institution.
	* Then **Projects** outside of work.
	* Then **Skills** — review skills already identified during work experience and education, confirm them, and ask if there are any additional skills to add.
	* Finally, ask the user to **upload a profile picture**.
9. Within each section, fully complete one entry before moving to the next. For example, finish all work experience points for one role before asking about the next role.
10. After completing each section, briefly summarize what was captured and ask the user to confirm before moving to the next section.

#### Handling Corrections
11. If the user corrects a previous answer at any point in the conversation (e.g., "Actually, my title was Senior PM, not PM"), acknowledge the correction and issue an `update` action on the relevant record. Never create a duplicate record for a correction.
12. If the correction conflicts with previously stored data (e.g., different dates for the same role), flag the inconsistency, show both versions, and ask the user to confirm which is correct before updating.

#### Completing the Interview
13. When all sections have been covered and the user confirms they have nothing else to add, mark the `chat_session` status as `completed`.
14. Provide a closing summary of the full career graph that was built or updated.
15. Direct the user to their Profile Dashboard to review and manually edit if needed.
16. The tone throughout should remain conversational, motivational, and friendly. Celebrate progress (e.g., "Great, that's a strong set of experiences! Let's move on to your education.").

### Design Requirements 

#### Design System 
* The overall aesthetic should be **clean, modern, and professional** with a focus on readability and ease of use. 
* Use **shadcn/ui** as the component library with **Tailwind CSS** for styling. 
* Typography: Use a clean sans-serif font (e.g., Inter or the shadcn/ui default). Body text should be legible at 14-16px. 
* Color palette: Choose a primary brand color (to be finalized) with neutral grays for backgrounds and text. Use accent colors sparingly for CTAs and highlights. 
* Consistent spacing and padding across all pages. Follow an 8px spacing grid. 
* All interactive elements (buttons, inputs, links) should have clear hover and focus states. 
* Use toast notifications for success/error feedback on actions (e.g., "Career graph updated", "Resume generated"). 

#### Responsive Requirements 
All pages must be fully functional on mobile (360px+), tablet (768px+), and desktop (1024px+). Page-specific responsive notes:  

* **Landing Page**: Mobile-first design. Stack sections vertically on mobile. Hero section, feature cards, and "Coming Soon" roadmap items should reflow cleanly. 
* **AI Career Interview Page**: Should feel like a messaging app on mobile — full-screen chat with the input field fixed at the bottom. On desktop, optionally show a sidebar with a summary of the career graph being built. 
* **User Profile Dashboard**: Stack career graph sections (work experience, education, skills, projects) vertically on mobile. On desktop, use a two-column or card-based layout. 
* **Resume Dashboard**: Show the list of past resumes in a single-column list view on mobile. On desktop, use a grid/card layout with resume previews. The resume preview/PDF rendering is desktop-only for v1.

### Edge Cases & Error Handling 

#### AI Interview Edge Cases 

* **User abandons the conversation mid-interview** 
	* The `chat_session` status remains `in_progress` and the `current_topic` tracks where the AI left off. 
	* When the user returns, the AI should greet them, briefly summarize what has been captured so far, and resume from the `current_topic`. 
	* If the session is older than 30 days, the AI should ask if the user wants to continue or start fresh. 
* **User provides contradictory information** 
	* Example: User says they worked at Google from 2020-2023, then later says 2019-2022 for the same role. 
	* The AI should flag the inconsistency, quote both statements, and ask the user to clarify before writing or updating the database. 
	* The API layer should never overwrite existing records without explicit confirmation. 
* **Duplicate entity detection** 
	* Example: User says "Google" in one conversation and "Google LLC" in another. 
	* The API layer should perform fuzzy matching against the relevant lookup table (company, institution, skill, degree, discipline) before creating a new record. 
	* The AI should present the potential match to the user and ask them to confirm: "I found 'Google LLC' already in the system. Is this the same company?" 
	* If the user confirms, link to the existing record. If not, create a new one. 
* **User wants to correct a previous answer** 
	* The AI should support corrections at any point in the conversation (e.g., "Actually, my title was Senior PM, not PM"). 
	* The API layer should issue an `update` action on the relevant record rather than creating a duplicate. 
* **User gives persistently vague answers** 
	* The AI should make up to 2 follow-up attempts to get specifics (impact, metrics, dates). 
	* After 2 attempts, the AI should store what it has, mark the data point as incomplete internally (via a flag or note in `structured_data_extracted`), and move on. 
	* The AI should say something like: "No worries, we can come back to this later. Let's move on to [next topic]." 
* **Overlapping work experience dates** 
	* This is valid — users may hold multiple jobs simultaneously (e.g., full-time + freelance). 
	* The AI should confirm with the user: "It looks like this overlaps with your role at [Company]. Were you working both roles at the same time?" 
	* If confirmed, store both records without modification. 
* **User has no experience in a section** 
	* Example: User has no projects outside of work, or no extracurriculars. 
	* The AI should ask once, accept "none" or "nothing to add" gracefully, and move on without pushing. 

#### Resume Generation Edge Cases 
* **Job description is too short or vague** 
	* If the pasted job description is under 50 words or lacks clear requirements, the AI should inform the user: "This job description doesn't have enough detail for me to generate a tailored resume. Could you paste the full description?" 
* **User's career graph is too sparse** 
	* If the user has fewer than 1 work experience entry and no education, the AI should not attempt to generate a resume. 
	* Instead, redirect: "Your career profile doesn't have enough information yet. Let's complete your career interview first so I can generate a strong resume for you." 
	* Provide a link/button to the AI Career Interview Page.

* **User generates a resume with no work experience** 
	* The system should handle this gracefully by generating an education-and-projects-focused resume format rather than failing or showing an empty work section. 

#### Profile Dashboard Edge Cases 
* **User manually edits a company/institution name to match an existing record** 
	* The frontend should suggest existing matches as the user types (autocomplete from the lookup table). 
	* If the user's edit matches an existing record, prompt: "This matches an existing company in the system. Do you want to link to [Company Name] or create a new entry?" 
* **User deletes a work experience that has linked skills** 
	* Skills should NOT be auto-deleted because they may be associated with other experiences or confirmed independently. 
	* Show a warning: "This role has linked skills: [list]. The skills will remain on your profile. You can remove them separately from the Skills section if needed." 
* **User enters invalid date ranges** 
	* Frontend validation: End date must be after start date. If the user enters an end date before the start date, show an inline error and prevent saving. 
	* Allow empty end dates to indicate "present" / current role or ongoing education. 

#### General Edge Cases 
* **Session timeout or network disconnection during AI interview** 
	* All messages are persisted to `chat_message` in real time, so no conversation data is lost. 
	* On reconnection, the frontend should reload the conversation history and the AI should continue from where it left off. 
* **User returns after a long period of inactivity (weeks/months)** 
	* The AI's existing-user flow should handle both fully completed and partially completed profiles. 
	* For partially completed profiles: "Welcome back! Last time we were working on your [current_topic]. Would you like to continue from there, or is there something new you'd like to add?" 
	* For fully completed profiles: "Welcome back! Your career profile was last updated on [date]. Has anything changed since then?" 
* **Concurrent sessions** 
	* If a user has the AI interview open in multiple tabs, the system should use the latest `chat_session` and not create duplicate sessions. 
	* The API layer should check for an existing `in_progress` session before creating a new one.
