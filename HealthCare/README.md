
PATIENT
- patient_id (primary key)
- first_name
- last_name
- date_of_birth
- gender
- address
- phone_number
- email_address
- password



DOCTOR
- doctor_id (primary key)
- first_name
- last_name
- speciality
- address
- phone_number
- email_address
- fees
- password


HOSPITAL
- hospital id(primary key)
- hospital name
- address
- password
- email
- phone_number


INSURANCE_company
- insurance_company_id (primary key)
- company name
- address
- phone_number
- email_address
- password


INSURANCE_PLAN
- insurance_plan_id (primary key)
- insurance_company_id 
- insurance plan name
- amount
- duration


APPOINTMENTS
- appointment_id (primary key)
- patient_id (foreign key to PATIENTS)
- doctor_id (foreign key to DOCTORS)
- hospital_id(foreign key to hospital)
- appointment_date
- Disease
- appointment_time
- appointment_fee
- appointment_status



PATIENT_INSURANCE
- patient_insurance_id (primary key)
- patient_id (foreign key to PATIENTS)
- insurance_plan_id
- policy_number
- policy buy date
- subscriber_first_name(Person who pays the premium.)
- subscriber_last_name
- subscriber_date_of_birth
- subscriber_phonenno



CLAIMS
- claim_id (primary key)
- insurance_company_id 
- insurance_plan_id
- patient_id
- hospital_id
- admit_id
- claim_date
- claim_amount
- claim_status
- total_amount



Patient_Products_Used

- Patients_products_used_id
- patient_admit_id
- Product_id
- quantity


PATIENT_BILLING
- billing_id (primary key)
- patient_id ( PATIENTS table)
- admit_id ( PATIENT_ADMIT  table)
- claim_id ( CLAIMS table)
- billing_date
- billing_total_amount
- claim_amount
- payable_amount
- payment_status

  
PATIENT_ADMIT
- patient_admit_id
- patient_id
- doctor_id
- hospital_id
- admit_date
- admit_time
- discharge_date
- discharge_time
- billing amount


ADMIN 
- admin_id
- password 
- first_name    
- last_name 
- email_address 
- phone_number    

     
DoctorHospitalAssociation
- id
- doctor_id
- hospital_id


HospitalInsuranceAssociation
- hospital_insurance_id
- hospital_id
- insurance_company_id


Products
- Id
- Product_name
- Price
- quantity


Doctor_Availability
- doctor_availability_id
- hospital_id
- doctor_id
- day_of_week
- start_time
- end_time
- duration





