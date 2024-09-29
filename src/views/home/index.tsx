import { FC } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from 'components/ui/card';
import { SwordsIcon, PenLineIcon, NotebookText } from 'lucide-react';

const actionCards: Array<{
  title: string;
  href: string;
  description: React.ReactNode;
  icon: React.ReactNode;
}> = [
    {
      title: "Create Game",
      href: "/create-game",
      description: "Create a World Conquest's game.",
      icon: <PenLineIcon size={50} />,
    },
    {
      title: "Join Game",
      href: "/join-game",
      description:
        "Join an existing World Conquest's game.",
      icon: <SwordsIcon size={50} />,
    },
    {
      title: "Read Rules",
      href: "/rules",
      description:
        "Read World Conquest's rules and learn how to play.",
      icon: <NotebookText size={50} />,
    },
  ];

export const HomeView: FC = ({ }) => {
  return (

    <div className="md:hero mx-auto p-4">
        <section
          id="features"
          className={
            "space-y-12 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
          }
        >

          <div className="mx-auto mt-[20%] grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {actionCards.map((item, key) => (
              <Link key={key} href={item.href} className="group">
                <Card className="border-secondary group-hover:border-white">
                  <CardHeader>
                    <CardTitle className="space-y-3">
                      {item.icon}
                      <span className="block font-bold group-hover:text-pretty">
                        {item.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
  );
};
