export function Footer() {
  console.debug("Rendering component Footer");

  return (
    <footer className="container">
      <p>
        <small>
          All rights reserved. 🔥 This website is fueled by{" "}
          <a href="https://github.com/hongaar/examtraining">
            open source software
          </a>
          . 🗑️&nbsp;
          <a
            href="/"
            onClick={(event) => {
              if (
                window.confirm(
                  "You will lose all locally stored data which contain e.g. your correctly answered questions. Are you sure you want to reset all your local data?",
                )
              ) {
                localStorage.clear();
              } else {
                event.preventDefault();
              }
            }}
          >
            <del>Reset all local data</del>
          </a>
        </small>
      </p>
    </footer>
  );
}
