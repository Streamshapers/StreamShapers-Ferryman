import {useContext} from "react";
import {GlobalStateContext} from "./Context/GlobalStateContext";

function GeneralAlerts() {
    const {generalAlerts} = useContext(GlobalStateContext);

    if (!generalAlerts) {
        return;
    }

    return (
        <>
            {generalAlerts.map((alert, i) => {
                return (
                    <div key={i} className={alert.type === "alert" ? "alert-wrapper" : "error-wrapper"}>
                        <div className={alert.type === "alert" ? "alert" : "error"}>
                            <b>{alert.title}</b>{" " + alert.message} {alert.link  ? <a target="_blank" rel="noopener noreferrer" href={alert.link}>{alert.linkName}</a>: null}
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default GeneralAlerts;