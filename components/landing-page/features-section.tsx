import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface FeatureProps {
  title: string;
  description: string;
}

const featureList: FeatureProps[] = [
  {
    title: "Live collaboration",
    description:
      "Powerful, interactive whiteboard that lets you work together in real time",
  },
  {
    title: "Voice Chat",
    description:
      "Talk in real time to explain ideas and solve problems together. ",
  },
  {
    title: "Classrooms",
    description:
      "Share files, compile notes, and keep the conversation going with real-time text chat.",
  },
  {
    title: "AI Note Assistant",
    description:
      "Streamline your note-taking process with an AI-powered assistant designed to summarize, organize, and enhance your lessons",
  },
];

export default function FeaturesSection() {
  return (
    <section className="container px-24 py-10">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary mb-2 tracking-wider">Features</h2>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🚀 Everything You Need for Online Tutoring
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Our project is the first step towards a comprehensive system to
            support tutors. Designed with simplicity and convenience in mind, it
            combines live voice calls, an interactive whiteboard, and chat all
            in one place. Enjoy free access, robust security, and full
            responsiveness – including on the iPad, the go-to device for
            note-taking and drawing!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {featureList.map(({ title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-end">
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
