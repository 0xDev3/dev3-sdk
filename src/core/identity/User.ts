import { MainApi } from "../api/main-api";
import { AddressBookEntries, AddressBookEntry, CreateAddressBookEntryRequest, JwtToken, UpdateAddressBookEntryRequest } from "../types";

export class User {

    public readonly wallet: string;
    public readonly jwt: JwtToken;

    constructor(
        wallet: string,
        jwt: JwtToken
    ) {
        this.wallet = wallet;
        this.jwt = jwt;
    }

    public async addToAddressBook(
        request: CreateAddressBookEntryRequest
    ): Promise<AddressBookEntry> {
        return MainApi.instance().createAddressBookEntry(
            request,
            this.jwt
        );
    }

    public async getFromAddressBook(alias: string): Promise<AddressBookEntry> {
        return MainApi.instance().fetchAddressBookEntryByAlias(
            { alias },
            this.jwt
        );
    }

    public async getAllFromAddressBook(): Promise<AddressBookEntries> {
        return MainApi.instance().fetchAddressBookEntries(
            this.wallet,
            this.jwt
        );
    }

    public async updateAddressBook(
        request: UpdateAddressBookEntryRequest
    ): Promise<AddressBookEntry> {
        return MainApi.instance().updateAddressBookEntry(
            request,
            this.jwt
        );
    }
}
