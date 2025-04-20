import { useActionState, useEffect, useRef, useState } from "react";
import "./App.css";
import { Form } from "./component/form";
import Button from "./component/button";
import { ArrowLeft } from "lucide-react";

function App() {
  const [countryList, setCountryList] = useState(null);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(120); // in seconds

  // for form loading state
  const [isLoading, setIsLoading] = useState(false);

  // to send to api again when verifying otp
  const submittedCountryRef = useRef(null);

  // cancel old request
  const abortControllerRef = useRef(null);

  // temporary user id
  const userIdRef = useRef("abc1234");

  // submit phone to api
  const handlePhoneSubmit = async (formData) => {
    const payload = {
      ...formData,
      user_id: userIdRef.current,
    };

    submittedCountryRef.current = formData.country;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(
        "https://0ct5ps-3001.csb.app/api/v1/trigger-pin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        }
      );
      const result = await res.json();

      console.log(result);

      if (!result.success) {
        setError("Make sure all field are filled.");
      } else {
        setStep(2);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // submit otp to api
  const handleOtpSubmit = async (formData) => {
    const payload = {
      ...formData,
      country: submittedCountryRef.current,
      pin: Number(formData.pin),
      user_id: userIdRef.current,
    };

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("https://0ct5ps-3001.csb.app/api/v1/verify-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });
      const result = await res.json();

      console.log(result);

      if (!result.success) {
        setError(result.error);
      } else {
        setStep(3);
        setUrl(result.product_url);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // set up country list
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("data/country-code.json");
        const list = await res.json();
        setCountryList(list);
      } catch (err) {
        console.log("Error: " + err);
      }
    })();
  }, []);

  // format countdown
  const formatTime = () => {
    const m = String(Math.floor(timer / 60)).padStart(2, "0");
    const s = String(timer % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // timer countdown on thank you
  useEffect(() => {
    let timer;
    if (step == 3) {
      timer = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [step]);

  if (step == 1) {
    return (
      <>
        {/* form */}
        <div className="card">
          <h1>SIGN UP</h1>
          <p>Register now and receive extra candies!</p>
          <br />
          <Form
            onSubmit={handlePhoneSubmit}
            id="form-phone"
            initialValues={{ country: "MY", msisdn: "" }}
          >
            <div>
              <Form.Label htmlFor="country" label="Country" />
              <Form.Select name="country">
                {countryList?.map((c) => (
                  <Form.Option
                    key={c.code}
                    value={c.code}
                    label={`${c.emoji} ${c.name}`}
                  />
                ))}
              </Form.Select>
            </div>

            <div>
              <Form.Label htmlFor="msisdn" label="Phone Number" />
              <Form.Input
                name="msisdn"
                type="tel"
                required
                pattern="^(\+?\d{1,4})?([0-9]\d{7,12})$"
              />
              <Form.Description>Format: 0123456789</Form.Description>
              {error && <Form.Error error={error} />}
            </div>
          </Form>

          <Button
            className="btn-submit"
            form="form-phone"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Proceed"}
          </Button>
        </div>
      </>
    );
  } else if (step == 2) {
    return (
      <div className="card">
        <Button
          type="button"
          className="btn-back"
          onClick={() => setStep((prev) => prev - 1)}
        >
          <ArrowLeft size={16} color="rgb(56, 56, 56)" />
        </Button>

        <h1>Enter Pin</h1>
        <p>Enter the pin we sent to your phone below.</p>
        <br />

        <Form
          onSubmit={handleOtpSubmit}
          id="form-otp"
          initialValues={{ pin: "" }}
        >
          <div>
            <Form.Label htmlFor="pin" label="Pin Number" />
            <Form.Input name="pin" required />
            {error && <Form.Error error={error} />}
          </div>
        </Form>

        <Button
          className="btn-submit"
          form="form-otp"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Verify"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-center">Sign Up Success!</h1>

      <h2 className="mt-3 text-center">
        {timer == 0
          ? "Bonus candy expired :("
          : `Bonus candy expires in ${formatTime()} minutes! Hurry!`}
      </h2>

      <a href={url} className="btn-cta">
        Login Now!
      </a>
    </>
  );
}

export default App;
