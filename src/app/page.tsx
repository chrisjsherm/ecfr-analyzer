import { getAgencies } from "./actions/agencies";
import ChangeCount from "./components/ChangeCount";
import ChangeCountChart from "./components/ChangeCountChart";
export default async function Home() {
  const { agencies } = await getAgencies();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 w-full max-w-4xl">
        <ChangeCount agencies={agencies} />
        <ChangeCountChart agencies={agencies} />
      </main>
    </div>
  );
}
