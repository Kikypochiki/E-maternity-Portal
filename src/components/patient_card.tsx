interface PatientCardProps {
  patient:{
    patient_first_name: string,
    patient_last_name: string,
    patient_id: string;
    patient_status: string;

  }
}
const defaultPatient = {
  patient_first_name: '',
  patient_last_name: '',
  patient_id: '',
  patient_status: ''
}

export default function PatientCard({ patient = defaultPatient, ...props }: PatientCardProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="patient-card" {...props}>
    <div className="flex flex-col h-15 justify-center w-full sm:w-full p-5 border-t hover:bg-accent">
      <div className="flex flex-row items-center text-left">
          <h2 className="text-sm font-semibold sm:text-lg truncate w-full">{`${patient.patient_first_name} ${patient.patient_last_name}`}</h2>
          <h2 className="text-sm font-semibold sm:text-lg truncate w-full">{patient.patient_id}</h2>
          {patient.patient_status === 'active' ? (
            <h2 className="text-sm font-semibold sm:text-lg truncate w-full text-green-500">{patient.patient_status}</h2>
          ) : (
            <h2 className="text-sm font-semibold sm:text-lg truncate w-full text-red-500">{patient.patient_status}</h2>
          )}
        </div>
    </div>
    </div>
  );
}