const ContactForm = () => {
  return (
    <div
      className="row justify-center mt-18"
      data-aos="fade-up-sm"
      data-aos-delay="50"
    >
      <div className="col-lg-8 col-xl-6">
        <form
          className="vstack gap-8"
          id="contact-form"
          method="post"
          action="assets/php/contact_email.php"
        >
          <div className="">
            <label htmlFor="name" className="form-label fs-lg fw-medium mb-4">
              Your name*
            </label>
            <div className="input-group with-icon">
              <span className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <circle cx="12" cy="7" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </span>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control rounded-2"
                placeholder="What's your name?"
                required
              />
            </div>
          </div>
          <div className="">
            <label htmlFor="email" className="form-label fs-lg fw-medium mb-4">
              Email Address*
            </label>
            <div className="input-group with-icon">
              <span className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                >
                  <g
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                  >
                    <path d="M2.25 5.25a1.5 1.5 0 0 1 1.5-1.5h10.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-7.5Z" />
                    <path d="M2.25 5.25 9 9.75l6.75-4.5" />
                  </g>
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control rounded-2"
                placeholder="Enter Your Email"
                required
              />
            </div>
          </div>
          <div className="">
            <label htmlFor="phone" className="form-label fs-lg fw-medium mb-4">
              Phone Number
            </label>
            <div className="input-group with-icon">
              <span className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2m10 3a2 2 0 0 1 2 2m-2-6a6 6 0 0 1 6 6" />
                </svg>
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control rounded-2"
                placeholder="Phone Number"
              />
            </div>
          </div>
          <div className="">
            <label
              htmlFor="message"
              className="form-label fs-lg fw-medium mb-4"
            >
              Your Message*
            </label>
            <textarea
              id="message"
              name="message"
              className="form-control rounded-2"
              placeholder="Write here your details message"
              rows={4}
            ></textarea>
          </div>
          <div className="">
            <button type="submit" className="btn btn-primary-dark">
              Send Message
            </button>
          </div>
          <div className="status alert mb-0 d-none"></div>
        </form>
      </div>
    </div>
  );
};
export default ContactForm;
