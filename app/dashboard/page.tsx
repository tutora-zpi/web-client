import { ClassroomCard } from "@/components/dashboard/classroom-card";
import { CreateRoomDialog } from "@/components/dashboard/create-room-dialog";
import { Navbar } from "@/components/navbar";
import { Class } from "@/types/class";
import { cookies } from "next/headers";

const getClasses = async (): Promise<Class[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLASS_SERVICE}/classes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const classes = await response.json();

  return classes;
};

export default async function Dashboard() {
  const classes = await getClasses();

  return (
    <>
      <Navbar />
      <div
        className=" flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4 sm:justify-start md:grid-cols-3 lg:grid-cols-5
         "
      >
        <CreateRoomDialog />
        {classes.map((classroom) => (
          <ClassroomCard
            key={classroom.id}
            id={classroom.id}
            name={classroom.name}
            classUsers={classroom.members}
          />
        ))}
      </div>
    </>
  );
}
