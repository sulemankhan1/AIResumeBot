const MapCard = () => {
  return (
    <div
      className="ratio ratio-16x9 rounded-4 overflow-hidden mt-18"
      data-aos="fade-up-sm"
      data-aos-delay="150"
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d43342.12379278494!2d-115.1832297027355!3d36.15626909390534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80beb782a4f57dd1%3A0x3accd5e6d5b379a3!2sLas%20Vegas%2C%20NV%2C%20USA!5e0!3m2!1sen!2sbd!4v1681845950495!5m2!1sen!2sbd"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default MapCard;
