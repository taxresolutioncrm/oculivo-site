export const seoResources = [
  {
    slug:'optometry-scheduling-workflow',
    title:'Optometry Scheduling Workflow Guide',
    description:'A practical optometry scheduling workflow covering appointment types, provider availability, rooms, reminders, waitlists and rescheduling.',
    eyebrow:'Scheduling operations guide',
    h1:'Build an optometry schedule that reflects how the practice actually works.',
    intro:'Eye-care scheduling has to account for appointment type, provider, testing, rooms, optical handoffs and patient communication. A useful schedule should make those constraints visible before the day becomes overloaded.',
    sections:[
      ['Define appointment types and expected duration','Separate comprehensive exams, medical visits, contact lens work, follow-ups, testing and other appointment types so availability reflects the real time and resources required.'],
      ['Match appointments to provider and room capacity','Scheduling should account for which providers perform each visit type and whether testing rooms or equipment create additional constraints.'],
      ['Use reminders and confirmation status','Track confirmation, cancellation and reschedule activity so the front desk knows where the schedule is at risk before the patient is due to arrive.'],
      ['Maintain a useful waitlist','A waitlist should capture preferred days, times, provider or location so openings can be filled with patients who are actually able to accept them.']
    ],
    faq:[['What should optometry scheduling software track?','Appointment type, provider, location, duration, room or resource needs, status, reminders, confirmation and rescheduling history.'],['Why separate appointment types?','Different visits use different provider time, testing and room resources, so one generic appointment length can distort capacity.']]
  },
  {
    slug:'eye-care-insurance-verification-workflow',
    title:'Eye Care Insurance Verification Workflow',
    description:'A practical workflow for verifying medical and vision benefits before optometry and ophthalmology visits.',
    eyebrow:'Insurance workflow guide',
    h1:'Verify the coverage that changes the visit before the patient arrives.',
    intro:'Eye-care practices may work with medical insurance, vision plans or both. Verification is most useful when eligibility and benefit details are attached to the patient before scheduling, treatment and optical conversations depend on them.',
    sections:[
      ['Confirm the right payer and plan','Verify the patient, effective dates and plan information before spending time documenting benefits for the wrong coverage.'],
      ['Separate medical and vision benefits','Record which services are expected under medical insurance, vision benefits or self-pay so staff can explain the workflow consistently.'],
      ['Capture benefit details that affect the visit','Document copays, deductibles, allowances, frequency limits, authorization requirements and plan-specific notes that affect patient responsibility.'],
      ['Record source and verification date','Keep the verification date, source and staff notes with the patient so later users know how current the information is.']
    ],
    faq:[['What should eye-care insurance verification include?','Eligibility plus relevant copays, deductibles, allowances, frequency limits, authorization requirements and plan notes.'],['Why track the verification date?','Benefits can change, so the date helps staff decide whether information should be rechecked before relying on it.']]
  },
  {
    slug:'optometry-no-show-reduction-guide',
    title:'Optometry No-Show Reduction Guide',
    description:'How optometry practices can reduce missed appointments with confirmation workflows, reminders, waitlists and consistent follow-up.',
    eyebrow:'Patient access guide',
    h1:'Reduce empty chair time without turning reminders into noise.',
    intro:'No-show reduction starts with a clear confirmation process, easy rescheduling and a reliable way to fill openings. The goal is not more messages—it is better visibility into which appointments are actually at risk.',
    sections:[
      ['Track confirmation as a status','Separate confirmed, unconfirmed, rescheduled and canceled visits so staff can focus outreach where it matters.'],
      ['Use reminder timing intentionally','Combine advance reminders with a closer confirmation touch for appointments that remain unconfirmed rather than sending the same message to every patient.'],
      ['Make rescheduling easy','Patients are more likely to cancel or move an appointment when they have a simple way to respond instead of simply not arriving.'],
      ['Backfill openings from the waitlist','Use patient availability and appointment type to match openings quickly when a cancellation occurs.']
    ],
    faq:[['What is the best way to reduce optometry no-shows?','A consistent confirmation process, timely reminders, easy rescheduling and an actionable waitlist are the core operational tools.'],['Should every patient receive the same reminders?','Not necessarily. Practices can tailor outreach based on appointment type, confirmation status and timing.']]
  },
  {
    slug:'contact-lens-inventory-management-guide',
    title:'Contact Lens Inventory Management Guide',
    description:'A guide to managing contact lens stock, trial lenses, patient orders, vendors, receiving and dispensing in eye-care practices.',
    eyebrow:'Optical operations guide',
    h1:'Keep contact lens inventory connected to the patient order and dispensing workflow.',
    intro:'Contact lenses create a different inventory problem from frames. Practices may manage trial sets, retail boxes, patient-specific orders, vendor fulfillment and dispensing status at the same time.',
    sections:[
      ['Separate trial and retail inventory','Track diagnostic or trial lenses differently from retail boxes so on-hand counts and reorder decisions remain meaningful.'],
      ['Connect patient orders to product detail','Record brand, parameters, quantity, vendor, order status and patient allocation so staff can answer where an order stands.'],
      ['Track receiving and dispensing','Receiving should update inventory or patient order status, and dispensing should create a clear completion history.'],
      ['Monitor reorder and aging patterns','Use usage and order history to identify fast-moving products, overstock and items that tie up cash without serving patients.']
    ],
    faq:[['What should contact lens inventory software track?','Brand, parameters, quantity, lot or product identifiers where used, vendor, receiving, patient allocation, dispensing and reorder status.'],['Why separate trial lenses from retail inventory?','Their purpose and movement are different, and combining them can distort available stock and purchasing decisions.']]
  },
  {
    slug:'ophthalmology-referral-workflow',
    title:'Ophthalmology Referral Workflow Guide',
    description:'A workflow guide for managing incoming and outgoing ophthalmology referrals, documents, status, scheduling and communication.',
    eyebrow:'Referral workflow guide',
    h1:'Make referral status visible from request to completed visit.',
    intro:'Referrals can fail when records, authorization, scheduling and provider communication live in separate queues. A structured workflow should show what is missing and who owns the next step.',
    sections:[
      ['Capture referral source and reason','Record referring provider, patient, reason, urgency and required documents before the referral enters scheduling.'],
      ['Track missing records and authorization','Keep requests for records, imaging, authorization or prior testing attached to the referral so staff know what is still blocking the visit.'],
      ['Connect scheduling to referral status','Once the patient is scheduled, preserve the appointment and referral history together rather than closing the referral prematurely.'],
      ['Close the communication loop','Record whether consultation notes or results were sent back to the referring provider and when the referral was considered complete.']
    ],
    faq:[['What should referral tracking include?','Referral source, reason, urgency, required records, authorization, scheduling status, communication and completion.'],['Why track outgoing communication?','It helps the practice verify that referring providers received the information needed to continue patient care.']]
  },
  {
    slug:'optometry-billing-workflow-guide',
    title:'Optometry Billing Workflow Guide',
    description:'A practical optometry billing workflow covering charges, insurance, patient responsibility, claims, payments and follow-up.',
    eyebrow:'Revenue cycle guide',
    h1:'Keep billing connected to the visit, insurance context and patient balance.',
    intro:'Billing is easier to manage when charges, coverage, claims and patient responsibility share the same patient history instead of being reconciled after the fact.',
    sections:[
      ['Confirm visit and charge context','Verify that the services, products and supporting documentation associated with the visit are complete before billing moves forward.'],
      ['Separate payer and patient responsibility','Use current insurance context to estimate which amounts are expected from the payer and which belong to the patient.'],
      ['Track claim status and exceptions','Rejected, denied or pending claims should remain visible with the next action and supporting notes.'],
      ['Post payments and preserve balance history','Payments, adjustments and remaining balances should update the patient account while maintaining a readable transaction history.']
    ],
    faq:[['What should optometry billing software connect?','Visit charges, insurance information, claims, patient balances, payments, adjustments and communication history.'],['Why keep claim exceptions visible?','Outstanding rejections and denials can delay revenue if they disappear into a separate queue without ownership.']]
  },
  {
    slug:'multi-location-optometry-software-guide',
    title:'Multi-Location Optometry Software Guide',
    description:'What multi-location optometry practices should evaluate in software for scheduling, patient records, optical inventory, permissions and reporting.',
    eyebrow:'Multi-location practice guide',
    h1:'Give every eye-care location one operating model without losing local control.',
    intro:'Multi-location practices need consistent patient and operational data while preserving location-specific schedules, inventory, staff and permissions.',
    sections:[
      ['Define patient visibility across locations','Decide whether patient history should be available across the organization and how location-specific access or workflows should behave.'],
      ['Keep schedules and resources location-aware','Providers, rooms, equipment and appointment availability should be tied to the correct office while remaining visible to authorized centralized staff.'],
      ['Separate and consolidate inventory reporting','Each optical location needs accurate on-hand inventory, while leadership may need portfolio-level purchasing and aging visibility.'],
      ['Report consistently across offices','Use the same definitions for appointments, collections, recalls, inventory and workload so location comparisons are meaningful.']
    ],
    faq:[['What matters most in multi-location optometry software?','Patient continuity, location-aware scheduling, role permissions, inventory separation and consolidated reporting.'],['Should inventory be pooled across locations?','That depends on operations, but software should clearly show which location owns an item and support transfers where the practice allows them.']]
  },
  {
    slug:'optometry-patient-intake-workflow',
    title:'Optometry Patient Intake Workflow',
    description:'A patient intake workflow for demographics, insurance, history, forms, consent and pre-visit preparation in eye-care practices.',
    eyebrow:'Patient intake guide',
    h1:'Collect the information the visit needs before the exam starts.',
    intro:'Patient intake should prepare the front desk and clinical team rather than create another stack of forms to re-enter later.',
    sections:[
      ['Collect demographics once','Capture contact, address, preferred communication and required identity information in a structured patient record.'],
      ['Gather insurance before the visit','Request medical and vision coverage early enough for verification and scheduling decisions.'],
      ['Use forms that feed the workflow','History, consent and questionnaire responses should be available to the staff who need them without retyping or scanning paper.'],
      ['Flag missing information before arrival','A pre-visit checklist should show incomplete forms, insurance or required documents so staff can follow up before check-in.']
    ],
    faq:[['What should optometry patient intake include?','Demographics, contact information, insurance, medical and ocular history, consent and any practice-specific forms.'],['Why complete intake before arrival?','It reduces check-in delays and gives staff time to resolve missing coverage or paperwork before the appointment.']]
  },
  {
    slug:'optical-order-tracking-workflow',
    title:'Optical Order Tracking Workflow',
    description:'A practical workflow for tracking frame, lens and optical orders from patient selection through lab, receiving, quality check and dispensing.',
    eyebrow:'Optical order guide',
    h1:'Know where every optical order stands without calling the lab for every update.',
    intro:'Optical orders move through selection, measurements, lab or vendor processing, receiving, quality checks and dispensing. The patient record should make that status visible.',
    sections:[
      ['Create the order from the patient selection','Attach frame, lens details, measurements, pricing and vendor information directly to the patient order.'],
      ['Track vendor and lab status','Record order date, expected turnaround, status changes and exceptions so staff can answer patient questions quickly.'],
      ['Receive and quality-check before notifying','Confirm the order arrived and passed the practice’s quality process before marking it ready for pickup.'],
      ['Close with dispensing and remake history','Record when the order was dispensed and preserve remake or adjustment history if the order requires additional work.']
    ],
    faq:[['What should optical order tracking include?','Patient, products, measurements, vendor or lab, order date, status, expected completion, receiving, quality check and dispensing.'],['Why connect orders to inventory?','It helps distinguish available stock, patient-allocated product and items that are still on order.']]
  },
  {
    slug:'optometry-software-buyers-guide',
    title:'Optometry Practice Management Software Buyer’s Guide',
    description:'A buyer guide for optometry software covering scheduling, patient records, optical inventory, insurance, billing, communications and reporting.',
    eyebrow:'Software buyer’s guide',
    h1:'Evaluate optometry software around the patient journey—not a generic feature list.',
    intro:'Eye-care practices need front-desk, clinical, optical and financial workflows to stay connected. A software evaluation should follow one patient from scheduling through care, optical and payment.',
    sections:[
      ['Run one patient scenario end to end','Test scheduling, intake, insurance, exam workflow, optical order, billing and communication using the same patient record.'],
      ['Evaluate optical depth','Frame and contact lens inventory, orders, vendors, receiving and dispensing should work with the patient history rather than in an isolated stock system.'],
      ['Test communication and recall','Confirm reminders, recall, messages and follow-up are visible to the team and can be connected to scheduling outcomes.'],
      ['Review migration, permissions and reporting','Ask how patient history moves in, how roles are enforced and whether leadership can report across providers and locations.']
    ],
    faq:[['What should optometry software include?','Common needs include scheduling, patient records, clinical workflows, insurance, billing, optical inventory, communication, recall and reporting.'],['How should practices compare vendors?','Use the same realistic patient scenario and operating questions across vendors instead of comparing isolated feature checklists.']]
  }
] as const
