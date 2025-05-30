import { useParams } from 'react-router-dom'

const ViewFacultySchedule = () => {

    const { id } = useParams<{ id: string }>()

    console.log(id)



  return (
    <div>ViewFacultySchedule</div>
  )
}

export default ViewFacultySchedule