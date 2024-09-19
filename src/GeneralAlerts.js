import {useContext} from "react";
import {GlobalStateContext} from "./GlobalStateContext";

function GeneralAlerts() {
    const {generalAlerts} = useContext(GlobalStateContext);

    if (!generalAlerts) {
        return;
    }

    return (
        <div>
            {generalAlerts.map((alert, i) => {
                return (
                    <div key={i} className={alert.type === "alert" ? "alert-wrapper" : "error-wrapper"}>
                        <div className={alert.type === "alert" ? "alert" : "error"}>
                            <b>{alert.title}</b>{" " + alert.message} {alert.link  ? <a href={alert.link}>{alert.linkName}</a>: null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default GeneralAlerts;