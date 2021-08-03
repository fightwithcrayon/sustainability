import styles from "./Home.module.css";
import glob from "glob";
import Actions from "../components/Actions/Actions";
import Hero from "../components/Hero/Hero";
import Links from "../components/Links/Links";
import Title from "../components/Title/Title";

export default function Home({ data: { files, markdowns } }) {
  return (
    <>
      <section className={styles.intro} id="index">
        <Title
          className={styles.introTitle}
          id="index"
          isTop
          title="Sustainability Toolkit"
        />
        <Hero
          alt="A green office full of plants"
          image="/images/featured/toolkit_intro.jpg"
          isIntro
        >
          <p>
            This toolkit includes an overview of practical applications, methods
            and tools that help us put sustainable principles into practice. It
            covers topics such as material selection and design strategies, but
            also describes how to measure success.
          </p>
        </Hero>
      </section>
      {files.map(
        ({ actions, alt, description, headline, id, image, links, title }) => (
          <section className={styles.section} key={id}>
            <Title id={id} title={title} />
            <div className={`${styles.column} isWithinNavigation`}>
              <Hero alt={alt ?? title} hasNavigation image={`/images/${image}`}>
                <p>{headline}</p>
                {description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </Hero>
              <Actions actions={actions} id={id} markdowns={markdowns} />
              <Links links={links} />
            </div>
          </section>
        )
      )}
    </>
  );
}

export async function getStaticProps(context) {
  const yaml = require("js-yaml");
  const fs = require("fs");

  const files = fs.readdirSync("./content/process").map((filename) => {
    const data = yaml.load(
      fs.readFileSync(`./content/process/${filename}`, "utf-8")
    );
    return data;
  });

  const markdownPath = "./content/markdown/";
  const markdownFiles = glob.sync(`${markdownPath}**/*.md`);

  const markdowns = markdownFiles.map((filepath) => {
    const [id, index] = filepath
      .split(markdownPath)[1]
      .replace("\\", "/")
      .split("/");
    const markdown = fs.readFileSync(filepath, "utf-8");
    return {
      id: id.split("_")[1],
      index: Number(index.split(".md")[0]),
      markdown,
    };
  });

  return {
    props: {
      data: {
        files,
        markdowns,
      },
    },
  };
}
